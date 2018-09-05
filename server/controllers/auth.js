/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const axios = require('axios');
const bcrypt = require('bcrypt');
const MongoClient = require('mongodb').MongoClient;

const User = require('../models/users');

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

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

          if (valid) {
            delete user.password;
            req.session.user = user;
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

exports.sessions = (req, res, next) => {
  const email = req.params.email;
  MongoClient.connect('mongodb://localhost:27017', function (err, client) {
    if (err) throw err;

    var db = client.db('dash');

    db.collection('sessions').find().toArray(function(err, results) {
      if (err) throw err;
      const sessionArray = [];
      results.forEach(result => {
        if (result.session && result.session.user) {
          if (result.session.user.email === email) {
            sessionArray.push(result);
          }
        }
      });
      res.json(sessionArray);
      db.close();
      return next();
    });
  }); 
}

exports.session = (req, res, next) => {
  const sessionId = req.params.sessionId;
  MongoClient.connect('mongodb://localhost:27017', function (err, client) {
    if (err) throw err;

    var db = client.db('dash');

    db.collection('sessions').deleteOne({ _id: sessionId }, function(err, obj) {
      if (err) throw err;
      res.status = 200;
      res.json('Success');
      db.close();
      return next();
    });
  }); 
}