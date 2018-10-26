/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const { to } = _require('/utils/general');
const { ValidationError } = _require('/errors');
const organizationApprovedTemplate = _require('/assets/templates/email/organizationApproved.template.html');
const organizationDisapprovedTemplate = _require('/assets/templates/email/organizationDisapproved.template.html');
const emailService = _require('/utils/email');
const slug = require('slug');
const { hermes, token } = _require('/config');
const { httpPost } = _require('/utils/requests');

const User = _require('/models/users');
const Organization = _require('/models/organizations');
const OrganizationRequest = _require('/models/organization-request');

exports.edit = async (req, res, next) => {
  const organizationID = req.params.organizationID;
  const user = req.user;
  const query = req.body;
  let err, organizationUpdated;

  if (!user.permissions.includes('super_account') && user.organization._id !== organizationID) { return next(new PermissionError('You can only edit your own organization')); }

  const update = {};
  const allowedToChange = ['title', 'settings', 'legalAddress', 'active'];
  for (const key in query) {
    if (allowedToChange.indexOf(key) > -1) update[key] = query[key];
  }

  [err, organizationUpdated] = await to(Organization.findByIdAndUpdate(organizationID, update));
  if (err || !organizationUpdated) { logger.error('Organization update error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: organizationUpdated, message: 'Success', status: 200 };
  return next();
}

exports.check = async (req, res, next) => {
  const title = req.params.title;
  let err, organization;

  [err, organization] = await to(Organization.findOne({ title }));

  req.status = organization ? 200 : 400;
  req.json = { data: null, message: `${organization ? 'Organization exists' : 'No organization'}`, status: req.status };
  return next();
}

exports.getAll = async (req, res, next) => {
  let err, organizations;

  [err, organizations] = await to(
    Organization.find()
    .populate({
      path: 'owner',
      select: '-password -__v'
    })
    .select('-__v')
  );
  if (err) { logger.error('Organizations GET: ', err); return next(new ValidationError('Organizations error', err)); }

  req.status = 200;
  req.json = { data: organizations, message: 'Success', status: req.status };
  return next();
}

exports.getOrganizationRequests = async (req, res, next) => {
  let err, organizationRequests;

  [err, organizationRequests] = await to(OrganizationRequest.find());
  if (err) { logger.error('Organization requests GET: ', err); return next(new ValidationError('Organizations requests error', err)); }

  req.status = 200;
  req.json = { data: organizationRequests, message: 'Success', status: req.status };
  return next();
}

exports.organizationRequest = async (req, res, next) => {
  const { email, address, title, message } = req.body;
  let err, accountExists, organizationExists, organizationRequestExists, organizationRequestCreated;

  [err, organizationRequestExists] = await to(OrganizationRequest.findOne({ $or: [{ email }, { title }, { address }] }));
  if (organizationRequestExists) { return next(new ValidationError('Organization request with this email or organization title already exists')); }

  [err, organizationExists] = await to(Organization.findOne({ title }));
  if (organizationExists) { return next(new ValidationError('Organization with this title already exists')) }

  [err, accountExists] = await to(User.findOne({ $or: [{ email }, { address }] }));
  if (accountExists) { return next(new ValidationError('Account with this email or address already exists')); }

  req.body._id = new mongoose.Types.ObjectId();
  [err, organizationRequestCreated] = await to(OrganizationRequest.create(req.body));
  if (err) { return next(new ValidationError('Request create error', err)); }

  req.status = 201;
  req.json = { data: organizationRequestCreated, message: 'Success', status: req.status };
  return next();
}

exports.organizationRequestApproval = async (req, res, next) => {
  const { approved, organizationRequestID } = req.body;
  let err, organizationRequest, organizationRequestRemoved, hermesRegistered, userCreated, organizationCreated, confirmationEmail, organizationUpdated;

  [err, organizationRequest] = await to(OrganizationRequest.findById(organizationRequestID));
  if (err || !organizationRequest) { return next(new ValidationError('No organization request', err)); }

  if (!approved) {
    [err, organizationRequestRemoved] = await to(OrganizationRequest.findByIdAndRemove(organizationRequestID));
    if (err || !organizationRequestRemoved) { return next(new ValidationError('Removing request failed', err)); }

    // Send an email to user
    confirmationEmail = {};
    confirmationEmail.html = organizationDisapprovedTemplate;
    confirmationEmail.subject = `Your organization request has not been approved`;
    confirmationEmail.to = organizationRequest.email;
    confirmationEmail.from = `no-reply@dashboard.com`;
    [err, emailSent] = await to(emailService.send(confirmationEmail));
    if (err || !emailSent) { logger.error('Email SEND: ', err); }

    req.status = 200;
    req.json = { data: null, message: 'Request removed', status: req.status };
    return next();
  } else {
    // Register hermes accounts
    const body = {
      address: organizationRequest.address,
      accessLevel: 10,
      permissions: ['register_accounts', 'manage_accounts', 'create_asset', 'create_event']
    };
    [err, hermesRegistered] = await to(httpPost(`${hermes.url}/accounts`, body, token));
    if (err || !hermesRegistered) {
      logger.error('Hermes user registration: ', err);
      return next(new ValidationError((err && err.data ? err.data.reason : 'Hermes account registration failed'), err));
    }

    // Create organization
    [err, organizationCreated] = await to(Organization.create({ title: organizationRequest.title }));
    if (err || !organizationCreated) {
      logger.error('Organization create: ', err);
      return next(new ValidationError('Organization create failed', err));
    }

    // Create user accounts
    [err, userCreated] = await to(User.create({
      email: organizationRequest.email,
      address: organizationRequest.address,
      permissions: ['manage_organization', 'manage_accounts', 'create_asset', 'create_event'],
      organization: organizationCreated._id,
    }));
    if (err || !userCreated) {
      logger.error('User create: ', err);
      return next(new ValidationError('User create failed', err));
    }

    // Update organization's owner
    organizationCreated.owner = userCreated._id;
    [err, organizationUpdated] = await to(organizationCreated.save());
    if (err || !organizationUpdated) {
      logger.error('Organization update: ', err);
      return next(new ValidationError('Organization update failed', err));
    }

    // Send an email to user
    confirmationEmail = {};
    const url = `https://${req.get('host')}/login`;
    confirmationEmail.html = organizationApprovedTemplate.replace(/@url/g, url);
    confirmationEmail.subject = `Your organization request has been approved`;
    confirmationEmail.to = userCreated.email;
    confirmationEmail.from = `no-reply@${slug(organizationCreated.title)}.com`;
    [err, emailSent] = await to(emailService.send(confirmationEmail));
    if (err || !emailSent) { logger.error('Email SEND: ', err); }

    // Remove organization request
    [err, organizationRequestRemoved] = await to(OrganizationRequest.findByIdAndRemove(organizationRequestID));
    if (err || !organizationRequestRemoved) { return next(new ValidationError('Request approved, but failed to be removed', err)); }

    req.status = 201;
    req.json = { data: organizationCreated, message: 'Request approved', status: req.status };
    return next();
  }
}
