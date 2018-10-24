/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const slug = require('slug');
const config = _require('/config');
const { httpPost } = _require('/utils/requests');
const { to } = _require('/utils/general');
const { ValidationError, NotFoundError } = _require('/errors');
const { hermes } = _require('/config');
const emailService = _require('/utils/email');
const accountCreatedTemplate = _require('/assets/templates/email/accountCreated.template.html');

const User = _require('/models/users');
const Organization = _require('/models/organizations');
const Invite = _require('/models/invites');

/**
 * Create a new user.
 *
 * @name createUser
 * @route {POST} api/users/
 * @bodyparam user: {email, accessLevel, permissions}
 * @returns Status code 400 on failure
 * @returns user Object on success with status code 200
 */
exports.create = async (req, res, next) => {
  const { address, token } = req.body;
  const invite = req.invite || {};
  let err, userFound, userCreated, inviteRemoved, emailSent;

  [err, userFound] = await to(User.findOne({ email: invite.to, address }));
  if (err) { logger.error('User GET: ', err); return next(new ValidationError('User error', err)); }
  if (userFound) { return next(new ValidationError('User with this email or address already exists')); }

  [err, userCreated] = await to(User.create({
    _id: new mongoose.Types.ObjectId(),
    email: invite.to,
    organization: invite.organization,
    address,
  }));
  if (err || !userCreated) { logger.error('User CREATE: ', err); return next(new ValidationError('Account create error', err)); }

  // Send a confirmation email to user
  const confirmationEmail = {};
  const url = `https://${req.get('host')}/login`;
  confirmationEmail.html = accountCreatedTemplate.replace(/@url/g, url);
  confirmationEmail.subject = `Your account has been created for using ${invite.organization.title} Dashboard`;
  confirmationEmail.to = userCreated.email;
  confirmationEmail.from = `no-reply@${slug(invite.organization.title)}.com`;
  [err, emailSent] = await to(emailService.send(confirmationEmail));
  if (err || !emailSent) { logger.error('Email SEND: ', err); }

  // Delete invite
  [err, inviteRemoved] = await to(Invite.findOneAndRemove({ token }));
  if (err || !inviteRemoved) { logger.error('Invite delete error: ', err); }

  req.status = 201;
  req.json = { data: userCreated, message: 'Success', status: req.status }
  return next();
};

/**
 * Hermes account register
 *
 * @name hermesAccountRegister
 * @bodyparam user
 * @returns Status code 400 on failure
 * @returns Status code 200 on success
 */
exports.hermesAccountRegister = async (req, res, next) => {
  const { address } = req.body;
  const accessLevel = req.body.accessLevel || 1;
  const permissions = req.body.permissions || ['create_asset', 'create_event'];
  let err, userRegistered;

  const body = { address, accessLevel, permissions };

  [err, userRegistered] = await to(httpPost(`${hermes.url}/accounts`, body, config.token));
  if (err || !userRegistered) {
    logger.error('Hermes user registration error: ', err);
    return next(new ValidationError(err && err.data ? err.data.reason : 'Hermes account registration failed.'));
  }

  req.status = 200;
  return next();
};

/**
 * Get account details based on email address
 *
 * @name getAccount
 * @route {GET} api/users/
 * @returns Status code 400 on failure
 * @returns user Object on success with status code 200
 */
exports.getAccount = async (req, res, next) => {
  const email = req.params.email;
  let err, user;

  [err, user] = await to(
    User.findOne({ email })
    .populate({
      path: 'organization',
      select: '-active -createdAt -updatedAt -__v -owner',
    })
    .select('-active -createdAt -updatedAt -__v')
  );
  if (err || !user) { logger.error('User GET error: ', err); return next(new NotFoundError(err, err)); }

  req.status = 200;
  req.json = { data: user, message: 'Success', status: 200 };
  return next();
};

/**
 * Get list of accounts based on the user's organization
 *
 * @name getOrganizationAccounts
 * @route {GET} api/users/
 * @returns Status code 400 on failure
 * @returns users Object & number of users (count) on success with status code 200
 */
exports.getAccounts = async (req, res, next) => {
  const organization = req.query.organization || '';
  let err, users;

  [err, users] = await to(
    User.find({ organization })
    .populate({
      path: 'organization',
      select: '-active -createdAt -updatedAt -__v -owner',
    })
    .select('-password -__v')
  );
  if (err || !users) { logger.error('Users GET error: ', err); return next(new NotFoundError(err.message, err)); }

  req.status = 200;
  req.json = { data: users, message: 'Success', status: 200 };
  return next();
};

/**
 * Update user details using the user email address
 *
 * @name editUserDetails
 * @route {PUT} /users/:email
 * @queryparam email
 * @bodyparam userDetails: any
 * @returns Status code 400 on failure
 * @returns updateResponse Object on success with status code 200
 */
exports.edit = async (req, res, next) => {
  const email = req.params.email;
  const query = req.body;
  let err, user, userUpdated;

  [err, user] = await to(User.findOne({ email }));
  if (err || !user) { logger.error('User GET error: ', err); return next(new NotFoundError(err.message, err)); }

  const allowedToChange = ['full_name', 'email', 'password', 'timeZone', 'token'];
  for (const key in query) {
    if (allowedToChange.indexOf(key) > -1) { user[key] = query[key]; }
  }

  [err, userUpdated] = await to(user.save());
  if (err || !userUpdated) { logger.error('User update error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: userUpdated, message: 'Success', status: 200 };
  return next();
};
