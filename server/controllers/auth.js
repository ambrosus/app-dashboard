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

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const deviceInfo = req.body.deviceInfo;

  if (email && password) {
    User.findOne({ email })
      .populate({
        path: 'company',
        select: '-active -createdAt -updatedAt -__v -owner',
        populate: {
          path: 'hermes',
          select: '-active -createdAt -updatedAt -__v -public'
        }
      })
      .populate({
        path: 'role',
        select: '-createdAt -updatedAt -__v'
      })
      .select('-active -createdAt -updatedAt -__v')
      .then(user => {
        if (user) {
          const valid = bcrypt.compareSync(password, user.password);
          user.lastLogin = +new Date();
          user.save();

          if (valid) {
            delete user.password;
            req.session.user = user;
            req.session.deviceInfo = deviceInfo;
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

exports.verifyAccount = (req, res, next) => {
  const address = req.body.address;
  const token = req.body.token;
  const hermes = req.body.hermes;

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `AMB_TOKEN ${token}`
  };

  axios.get(`${hermes.url}/accounts/${address}`, { headers })
    .then(resp => {
      User.findOne({ address })
        .populate({
          path: 'company',
          select: '-active -createdAt -updatedAt -__v -owner',
          populate: {
            path: 'hermes',
            select: '-active -createdAt -updatedAt -__v -public'
          }
        })
        .populate({
          path: 'role',
          select: '-createdAt -updatedAt -__v'
        })
        .select('-active -createdAt -updatedAt -password -__v')
        .then(user => {
          if (user) {
            req.status = 200;
            req.session.user = user;
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
}

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

exports.getActiveSessions = (req, res, next) => {
  const email = req.session.user ? req.session.user.email : '';

  let sessionsCollection = mongoose.connection.db.collection('sessions');
  sessionsCollection.find({ "session.user.email": email }).toArray((err, sessions) => {

    if (!err || !sessions.length) {
      sessions = sessions.filter(session => {
        session.current = session.session.cookie.expires.toString() == req.session.cookie._expires.toString();
        return session;
      });

      req.status = 200;
      req.json = sessions;
      return next();
    } else {
      req.status = 401;
      req.json = { 'message': "No sessions were found." }
      return next();
    }

  });
}

exports.deleteSession = (req, res, next) => {
  const sessionId = req.params.sessionId;
  let collection = mongoose.connection.db.collection('sessions');

  collection.deleteOne({ _id: sessionId }, function(err, obj) {
    if (!err) {
      req.status = 200;
      req.json = { message: "Success" };
      return next();
    } else {
      req.status = 400;
      req.json = { message: "Session was not found." };
      return next();
    }

  });
}
