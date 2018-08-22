/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

const mongoose = require('mongoose');
const utilsPassword = require('../utils/password');
const Company = require('./../models/companies');

const User = require('../models/users');

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email && password) {
    const query = { email };

    User.findOne(query)
      .populate({
        path: 'company',
        populate: [
          { path: 'hermes' }
        ]
      })
      .then(user => {
        if (user) {
          const [address, secret] = utilsPassword.decrypt(user.token, password).split('|||');

          if (address && secret) {
            req.status = 200;
            req.json = {
              user,
              address,
              secret
            };
            return next();
          } else {
            req.status = 401;
            req.json = { message: '"password" is incorrect' };
            return next();
          }
        } else {
          throw 'No user found';
        }
      })
      .catch(error => {
        req.status = 400;
        req.json = { message: error };
        return next();
      });
  } else if (!address) {
    req.status = 400;
    req.json = { message: '"address" is required'  };
    return next();
  } else if (!password) {
    req.status = 400;
    req.json = { message: '"password" is required' };
    return next();
  }
};

exports.logout = (req, res, next) => {

}

exports.signup = (req, res, next) => {
  const full_name = req.body.full_name;
  const email = req.body.email;
  const company = req.body.company;
  const address = req.body.address;
  const password = req.body.password;
  const secret = req.body.secret;

  if (full_name && email && company && address) {

    User.findOne({ email })
      .then(user => {
        if (user) {
          throw 'Email is already in use';
        } else {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            full_name,
            email,
            address,
            token: utilsPassword.encrypt(`${address}|||${secret}`, password)
          });
          user
            .save()
            .then(createdUser => {
              req.status = 200;
              req.json = { message: 'Success' };
              return next();
            })
            .catch(error => {
              console.log(error);
              req.status = 400;
              req.json = { message: error };
              return next();
            })
        }
      })
      .catch(error => {
        console.log(error);
        req.status = 400;
        req.json = { message: error };
        return next();
      });
  } else if (!full_name) {
    req.status = 400;
    req.json = { message: '"full_name" is required' };
    return next();
  } else if (!email) {
    req.status = 400;
    req.json = { message: '"email" is required' };
    return next();
  } else if (!company) {
    req.status = 400;
    req.json = { message: '"company" is required' };
    return next();
  } else if (!address) {
    req.status = 400;
    req.json = { message: '"address" is required' };
    return next();
  }

}
