/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const bcrypt = require('bcrypt');
const { to } = _require('/utils/general');
const { ValidationError, NotFoundError } = _require('/errors');
const { httpGet } = _require('/utils/requests');
const { token, hermes } = _require('/config');

const User = _require('/models/users');

/**
 * Logs in user
 * Stores user email, user address on successful login
 *
 * @name login
 * @route {POST} api/auth/login
 * @bodyparam email, password
 * @returns Status code 400 on failure
 * @returns user Object on success with status code 200
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let err, user;

  if (email && password) {
    [err, user] = await to(
      User.findOne({ email })
      .populate({
        path: 'company',
        select: '-active -createdAt -updatedAt -__v -owner'
      })
      .select('-active -createdAt -updatedAt -__v')
    );
    if (err || !user) { logger.error('User GET error: ', err); return next(new NotFoundError(err ? err.message : 'No user', err)); }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return next(new ValidationError('User "password" is incorrect'));

    user.lastLogin = +new Date();
    user.save();

    user = user.toObject();
    delete user.password;

    req.status = 200;
    req.json = { data: user, message: 'Success', status: 200 };
    return next();

  } else if (!email) {
    next(new ValidationError('User "email" is required'));
  } else if (!password) {
    next(new ValidationError('User "password" is required'));
  }
};

/**
 * Verifies a user by calling the API (hermes.url/accounts/address)
 *
 * @name verify
 * @route {POST} api/auth/verify
 * @bodyparam address, token, hermes
 * @returns Status code 400 on failure
 * @returns user Object on success with status code 200
 */
exports.verifyAccount = async (req, res, next) => {
  const { address } = req.body;
  let err, verified, user;

  [err, verified] = await to(httpGet(`${hermes.url}/accounts/${address}`, token));
  if (err || !verified) { logger.error('Hermes account GET error: ', err); return next(new NotFoundError(err.data['reason'], err)); }

  [err, user] = await to(
    User.findOne({ address })
    .populate({
      path: 'company',
      select: '-active -createdAt -updatedAt -__v -owner'
    })
    .select('-active -createdAt -updatedAt -password -__v')
  );
  if (err) { logger.error('User GET error: ', err); }
  if (!user) {
    req.status = 200;
    req.json = { data: error, message: 'No registered user', status: 200 };
    return next();
  }

  user.toObject();
  delete user.password;

  req.status = 200;
  req.json = { data: user, message: 'Success', status: 200 };
  return next();
}
