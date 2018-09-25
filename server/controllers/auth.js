/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const axios = require('axios');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const User = require('../models/users');
const Company = require('../models/companies');

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
exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (email && password) {
    User.findOne({ email })
      .populate({
        path: 'company',
        select: '-active -createdAt -updatedAt -__v -owner',
        populate: { path: 'hermes' }
      })
      .populate({
        path: 'role',
        select: '-createdAt -updatedAt -__v'
      })
      .select('-active -createdAt -updatedAt -__v')
      .then(user => {
        if (user) {
          const valid = bcrypt.compareSync(password, user.password);
          if (valid) {
            user.lastLogin = +new Date();
            user.save();

            user = user.toObject();
            delete user.password;

            req.session.user = { _id: user._id, address: user.address, company: user.company, hermes: user.company.hermes };
            req.status = 200;
            req.json = user
            return next();

          } else { return res.status(401).json({ message: 'User "password" is incorrect' }); }
        } else { throw 'No user found'; }
      }).catch(error => (console.log(error), res.status(400).json({ message: error })));
  } else if (!email) {
    return res.status(400).json({ message: 'User "email" is required' });
  } else if (!password) {
    return res.status(400).json({ message: 'User "password" is required' });
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
exports.verifyAccount = (req, res, next) => {
  const { address, token, deviceInfo } = req.body;
  const companyId = req.session.user.company._id;

  Company.findById(companyId)
    .populate('hermes')
    .then(company => {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `AMB_TOKEN ${token}`
      };

      axios.get(`${company.hermes.url}/accounts/${address}`, { headers })
        .then(resp => {
          User.findOne({ address })
            .populate({
              path: 'company',
              select: '-active -createdAt -updatedAt -__v -owner',
              populate: { path: 'hermes' }
            })
            .populate({
              path: 'role',
              select: '-createdAt -updatedAt -__v'
            })
            .select('-active -createdAt -updatedAt -password -__v')
            .then(user => {
              if (user) {
                user.toObject();
                delete user.password;

                req.status = 200;
                req.session.user = { _id: user._id, address: user.address, company: user.company, hermes: user.company.hermes };
                req.session.deviceInfo = deviceInfo;
                req.json = user;
                return next();
              } else { throw 'No user found'; }
            })
            .catch(error => {
              req.status = 200;
              req.json = { message: 'No registered user' };
              return next();
            });
        }).catch(error => (console.log(error), res.status(400).json({ message: 'Hermes account error' })));
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Company GET error', error })));
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
  req.session.destroy(error => {
    if (error) {
      console.log('User logout error: ', error);
      return res.status(400).json({ message: 'User logout error' });
    }
    req.status = 200;
    req.json = { message: 'User logout success' };
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
      req.json = sessions;
      return next();
    } else { return res.status(401).json({ message: 'No sessions were found' }); }
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
      req.json = { message: "Success" };
      return next();
    } else { return res.status(400).json({ message: 'Session was not found' }); }
  });
}

exports.deleteSessions = (req, res, next) => {
  const userId = req.session.user._id;

  let sessionsCollection = mongoose.connection.db.collection('sessions');

  sessionsCollection.find({ "session.user._id": userId }).toArray((err, sessions) => {
    const currentSession = sessions.filter(session => {
      if (session.session.cookie.expires.toString() == req.session.cookie._expires.toString()) {
        return session;
      }
    });

    sessionsCollection.deleteMany({ 'session.user._id': userId, _id: { $ne: currentSession[0]._id } }, (err, response) => {
      if (!err) {
        req.status = 200;
        req.json = { message: "Success" };
        return next();
      } else {
        req.status = 400;
        req.json = { message: "Error in deleting sessions." };
        return next();
      }
    });

  })
}
