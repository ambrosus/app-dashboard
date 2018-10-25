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

const User = _require('/models/users');
const Organization = _require('/models/organizations');
const OrganizationRequest = _require('/models/organization-request');

exports.edit = async (req, res, next) => {
  const organizationID = req.params.organizationID;
  const user = req.user;
  const query = req.body;
  let err, organizationUpdated;

  if (!user.permissions.includes('super_admin') && user.organization._id !== organizationID) { return next(new PermissionError('You can only edit your own organization')); }

  const update = {};
  const allowedToChange = ['title', 'settings'];
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
  const { title } = req.query;
  let err, organization;

  [err, organization] = await to(Organization.findOne({ title }));

  req.status = organization ? 400 : 200;
  req.json = { data: null, message: `${organization ? 'Organization exists' : 'No organization'}`, status: req.status };
  return next();
}

exports.setOwnership = async (req, res, next) => {
  const user = req.body.user || {};
  const organization = req.body.organization || {};
  let err, _user, organizationUpdated, userUpdated;

  if (user && organization) {
    // Find user
    [err, _user] = await to(User.findById(user._id));
    if (err || !_user) { logger.error('User GET error: ', err); return next(new NotFoundError(err.message, err)); }

    // Update organization
    [err, organizationUpdated] = await to(Organization.findByIdAndUpdate(organization._id, { owner: user._id }));
    if (err || !organizationUpdated) { logger.error('Organization update error: ', err); return next(new ValidationError(err.message, err)); }

    // Update user
    _user.organization = organizationUpdated._id;
    [err, userUpdated] = await to(_user.save());
    if (err || !userUpdated) { logger.error('User update error: ', err); return next(new ValidationError(err.message, err)); }

    req.status = 200;
    req.json = { data: { user: userUpdated, organization: organizationUpdated }, message: 'Success', status: 200 };
    return next();

  } else if (!user) {
    return next(new ValidationError('"user" object is required'));
  } else if (!organization) {
    return next(new ValidationError('"organization" object is required'));
  }
};

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
