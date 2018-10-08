/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { to } = _require('/utils/general');
const { ValidationError, NotFoundError } = _require('/errors');
const { httpGet } = _require('/utils/requests');
const { token, hermes } = _require('/config');

const User = _require('/models/users');

/**
 * Logs in user
 * Stores user email, user address & deviceInfo on successful login
 *
 * @name login
 * @route {POST} api/auth/login
 * @bodyparam email, password, deviceInfo
 * @returns Status code 400 on failure
 * @returns user Object on success with status code 200
 */
exports.login = async (req, res, next) => {
  const { email, password, deviceInfo } = req.body;
  let err, user;

  if (email && password) {
    [err, user] = await to(
      User.findOne({ email })
      .populate({
        path: 'company',
        select: '-active -createdAt -updatedAt -__v -owner'
      })
      .populate({
        path: 'role',
        select: '-createdAt -updatedAt -__v'
      })
      .select('-active -createdAt -updatedAt -__v')
    );
    if (err || !user) { logger.error('User GET error: ', err); return next(new NotFoundError(err.message, err)); }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return next(new ValidationError('User "password" is incorrect'));

    user.lastLogin = +new Date();
    user.save();

    user = user.toObject();
    delete user.password;

    req.status = 200;
    req.session.user = { _id: user._id, address: user.address, company: user.company };
    req.session.deviceInfo = deviceInfo;
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
  const { address, deviceInfo } = req.body;
  let err, verified, user;

  [err, verified] = await to(httpGet(`${hermes.url}/accounts/${address}`, token));
  if (err || !verified) { logger.error('Hermes account GET error: ', err); return next(new NotFoundError(err.data['reason'], err)); }

  [err, user] = await to(
    User.findOne({ address })
    .populate({
      path: 'company',
      select: '-active -createdAt -updatedAt -__v -owner'
    })
    .populate({
      path: 'role',
      select: '-createdAt -updatedAt -__v'
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
  req.session.user = { _id: user._id, address: user.address, company: user.company };
  req.session.deviceInfo = deviceInfo;
  req.json = { data: user, message: 'Success', status: 200 };
  return next();
}

/**
 * Logs out a user by destroying the session
 *
 * @name logout
 * @route {DELETE} api/auth/logout
 * @returns Status code 400 on failure
 * @returns success message with status code 200 on success
 */
exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      logger.warn('User logout error: ', err);
      return next(new ValidationError(`User logout error: ${err.message}`, err));
    }
    req.status = 200;
    req.json = { data: null, message: 'Success', status: 200 };
    return next();
  });
}

/**
 * Get all active sessions for a user
 * Look up logged in user's email address in the session
 *
 * @name getActiveSessions
 * @route {GET} api/auth/sessions
 * @returns Status code 400 on failure
 * @returns array of sessions with status code 200 on success
 */
exports.getActiveSessions = (req, res, next) => {
  const userId = req.session.user ? req.session.user._id : '';

  let sessionsCollection = mongoose.connection.db.collection('sessions');
  sessionsCollection.find({ "session.user._id": userId }).toArray((err, sessions) => {

    if (!err || !sessions.length) {
      sessions = sessions.filter(session => {
        session.current = session.session.cookie.expires.toString() == req.session.cookie._expires.toString();
        return session;
      });

      req.status = 200;
      req.json = { data: sessions, message: 'Success', status: 200 };
      return next();
    } else { return next(new NotFoundError('No sessions were found', err)); }
  });
}

/**
 * Destroy all the sessions except the current one
 *
 * @name deleteSession
 * @route {DELETE} api/auth/sessions/:sessionId
 * @returns Status code 400 on failure
 * @returns success message with status code 200 on success
 */
exports.deleteSession = (req, res, next) => {
  const sessionId = req.params.sessionId;
  let collection = mongoose.connection.db.collection('sessions');

  collection.deleteOne({ _id: sessionId }, function(err, obj) {
    if (!err) {
      req.status = 200;
      req.json = { data: null, message: 'Success', status: 200 };
      return next();
    } else { return next(new NotFoundError('Session was not found', err)); }
  });
}

exports.deleteSessions = (req, res, next) => {
  const userId = req.session.user._id;

  let sessionsCollection = mongoose.connection.db.collection('sessions');

  sessionsCollection.find({ "session.user._id": userId }).toArray((err, sessions) => {
    const currentSession = sessions.filter(session => {
      if (session.session.cookie.expires.toString() == req.session.cookie._expires.toString()) { return session; }
    });

    sessionsCollection.deleteMany({ 'session.user._id': userId, _id: { $ne: currentSession[0]._id } }, (err, response) => {
      if (!err) {
        req.status = 200;
        req.json = { data: null, message: 'Success', status: 200 };
        return next();
      } else { return next(new ValidationError(err.message, err)); }
    });
  })
}
