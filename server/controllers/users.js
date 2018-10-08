/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const bcrypt = require('bcrypt');
const { decrypt } = _require('/utils/password');
const mongoose = require('mongoose');
const config = _require('/config');
const Web3 = require('web3');
const web3 = new Web3();
const { httpPost } = _require('/utils/requests');
const { to } = _require('/utils/general');
const { ValidationError, NotFoundError, AuthenticationError } = _require('/errors');
const { hermes } = _require('/config');

const User = _require('/models/users');
const Company = _require('/models/companies');
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
  const user = req.body.user || {};
  const { full_name, address, token, password } = user;
  const inviteToken = req.query.token;
  let email = user.email;
  let accessLevel = user.accessLevel || 1;
  let permissions = user.permissions || ['create_asset', 'create_event'];
  let company = '';
  let err, userCreated, userRegistered, inviteRemoved;

  // invite
  if (inviteToken) {
    try {
      const _token = JSON.parse(decrypt(inviteToken, config.secret));
      email = _token['email'];
      accessLevel = _token['accessLevel'];
      company = _token['company'];

      if (_token['role']['title'] === 'admin') {
        permissions = ['register_accounts', 'create_asset', 'create_event'];
      }

    } catch (error) {
      return res.status(400).json({ message: 'Invite token is invalid' });
    }
  }

  // Insert user in dash db
  [err, userCreated] = await to(User.findOrCreate(query, _user));
  if (err || !userCreated) { logger.error('User create error: ', err); return next(new ValidationError(err.message, err)); }
  if (!userCreated.created) { return next(new ValidationError('User already exists')); }

  // Register user in the hermes
  const body = { address, permissions, accessLevel };
  [err, userRegistered] = await to(httpPost(`${hermes.url}/accounts`, body, config.token));
  if (err || !userRegistered) { logger.error('Hermes user registration error: ', err); return next(new ValidationError(err.data['reason'], err)); }

  // Delete invite token
  if (inviteToken) {
    [err, inviteRemoved] = await to(Invite.findOneAndRemove({ token: inviteToken }));
    if (err || !inviteRemoved) { logger.error('Invite delete error: ', err); }
    if (inviteRemoved) { logger.info('Invited deleted'); }
  }

  req.status = 200;
  req.json = { data: userCreated.doc, message: 'Success', status: 200 };
  return next();
};

/**
 * Sets company ownership
 *
 * @name setOwnership
 * @route {POST} api/setup
 * @bodyparam user, company
 * @returns Status code 400 on failure
 * @returns Status code 200 on success
 */

exports.setOwnership = async (req, res, next) => {
  const user = req.user;
  const company = req.company || req.body.company;
  let err, _user, companyUpdated;

  if (user && company) {
    // Find user
    [err, _user] = await to(User.findById(user._id));
    if (err || !_user) { logger.error('User GET error: ', err); return next(new NotFoundError(err.message, err)); }

    // Update company
    [err, companyUpdated] = await to(Company.findByIdAndUpdate(company._id, { owner: user._id }));
    if (err || !companyUpdated) { logger.error('Company update error: ', err); return next(new ValidationError(err.message, err)); }

    req.status = 200;
    req.json = { data: companyUpdated, message: 'Success', status: 200 };
    return next();

  } else if (!user) {
    return next(new ValidationError('"user" object is required'));
  } else if (!company) {
    return next(new ValidationError('"company" object is required'));
  }

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
      path: 'company',
      select: '-active -createdAt -updatedAt -__v -owner',
    })
    .populate({
      path: 'role',
      select: '-createdAt -updatedAt -__v',
    })
    .select('-active -createdAt -updatedAt -__v')
  );
  if (err || !user) { logger.error('User GET error: ', err); return next(new NotFoundError(err.message, err)); }

  req.status = 200;
  req.json = { data: user, message: 'Success', status: 200 };
  return next();
};

/**
 * Get list of accounts based on the user's company
 *
 * @name getCompanyAccounts
 * @route {GET} api/users/
 * @returns Status code 400 on failure
 * @returns users Object & number of users (count) on success with status code 200
 */
exports.getAccounts = async (req, res, next) => {
  const company = req.session.user.company || '';
  let err, users;

  [err, users] = await to(
    User.find({ company })
    .populate({
      path: 'company',
      select: '-active -createdAt -updatedAt -__v -owner',
    })
    .populate({
      path: 'role',
      select: '-createdAt -updatedAt -__v',
    })
    .select('-password -__v')
  );
  if (err || !users) { logger.error('Users GET error: ', err); return next(new NotFoundError(err.message, err)); }

  req.status = 200;
  req.json = { data: users, message: 'Success', status: 200 };
  return next();
};

/**
 * Get settings of a particular user (query using email address)
 *
 * @name getSettings
 * @route {GET} /settings/:email
 * @queryparam email
 * @returns Status code 400 on failure
 * @returns userSettings (user.settings) Object on success with status code 200
 */
exports.getSettings = async (req, res, next) => {
  const email = req.params.email;
  let err, user;

  [err, user] = await to(User.findOne({ email }));
  if (err || !user) { logger.error('User GET error: ', err); return next(new NotFoundError(err.message, err)); }

  req.status = 200;
  req.json = { data: user.settings, message: 'Success', status: 200 };
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
  let err, userUpdated;

  const update = {};
  const allowedToChange = ['full_name', 'settings', 'profile'];
  for (const key in query) {
    if (allowedToChange.indexOf(key) > -1) update[key] = query[key];
  }

  [err, userUpdated] = await to(User.updateOne({ email }, update));
  if (err || !userUpdated) { logger.error('User update error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: userUpdated, message: 'Success', status: 200 };
  return next();
};

/**
 * Change password of a user using their email address
 *
 * @name changePassword
 * @route {PUT} /users/password
 * @bodyparam email, oldPassword, newPassword
 * @returns Status code 400 on failure
 * @returns Password success message on success with status code 200
 */
exports.changePassword = async (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;
  let err, user, userUpdated;

  if (email && oldPassword && newPassword) {
    [err, user] = await to(User.findOne({ email }));
    if (err || !user) { logger.error('User GET error: ', err); return next(new ValidationError(err.message, err)); }

    try {
      const valid = bcrypt.compareSync(oldPassword, user.password);
      if (!valid) return next(new ValidationError('User "password" is incorrect'));

      const decData = web3.eth.accounts.decrypt(JSON.parse(user.token), oldPassword);
      const encData = web3.eth.accounts.encrypt(decData.privateKey, newPassword);
      user.token = JSON.stringify(encData);

      user.password = newPassword;

      [err, userUpdated] = await to(user.save());
      if (err || !userUpdated) { logger.error('User update error: ', err); return next(new ValidationError(err.message, err)); }

      req.status = 200;
      req.json = { data: userUpdated, message: 'Success', status: 200 };
      return next();
    } catch (e) { return next(new ValidationError('Password is incorrect')); }
  } else if (!email) {
    return next(new ValidationError('"email" is required'));
  } else if (!oldPassword) {
    return next(new ValidationError('"oldPassword" is required'));
  } else if (!newPassword) {
    return next(new ValidationError('"newPassword" is required'));
  }
};

/**
 * Assign roles (role ObjectID) to users using their email address
 *
 * @name assignRole
 * @route {POST} api/users/role
 * @bodyparam email, role (Mongoose objectID)
 * @returns Status code 400 on failure
 * @returns Save success message on success with status code 200
 */
exports.assignRole = async (req, res, next) => {
  const { email, role } = req.body;
  let err, userUpdated;

  if (email && role) {
    [err, userUpdated] = await to(User.findOneAndUpdate({ email }, { role }));
    if (err || !userUpdated) { logger.error('User update error: ', err); return next(new ValidationError(err.message, err)); }

    req.status = 200;
    req.json = { data: userUpdated, message: 'Success', status: 200 };
    return next();

  } else if (!email) {
    return next(new ValidationError('"email" is required'));
  } else if (!role) {
    return next(new ValidationError('"role" objectID is required'));
  }
};
