/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const utilsPassword = require('../utils/password');
const mongoose = require('mongoose');
const config = require('../config');
const axios = require('axios');
const bcrypt = require('bcrypt');

const User = require('../models/users');
const Company = require('../models/companies');
const Role = require('../models/roles');

exports.create = (req, res, next) => {
  const full_name = req.body.user ? req.body.user.full_name : null;
  const email = req.body.user ? req.body.user.email : null;
  const address = req.body.user ? req.body.user.address : null;
  const secret = req.body.user ? req.body.user.secret : null;
  const password = req.body.user ? req.body.user.password : null;
  const accessLevel = req.body.user ? req.body.user.accessLevel : 1;
  const permissions = req.body.user ? req.body.user.permissions : ['create_entity'];
  const hermes = req.hermes || req.body.hermes;

  if (full_name && email && address && password && hermes) {
    User.findOne({ email })
      .then(user => {
        if (!user) {
          bcrypt.hash(password, 10, (err, hash) => {
            if (!err) {
              const user = new User({
                _id: new mongoose.Types.ObjectId(),
                full_name,
                email,
                address,
                token: utilsPassword.encrypt(`${address}|||${secret}`, password),
                password: hash
              });

              user
                .save()
                .then(user => {
                  Role.findOne({ title: 'user' })
                    .then(role => {
                      if (role) {
                        user.role = role;
                        user.save();

                        // Register user in the hermes
                        const headers = {
                          Accept: 'application/json',
                          'Content-Type': 'application/json',
                          Authorization: `AMB_TOKEN ${config.token}`
                        };
                        const body = {
                          address,
                          permissions,
                          accessLevel
                        }
                        axios.post(`${hermes.url}/accounts`, body, { headers })
                          .then(registered => {
                            req.status = 200;
                            req.user = user;
                            return next();
                          }).catch(error => (console.log(error), res.status(400).json({ message: 'Hermes error' })));
                      } else { throw 'No user role'; }
                    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
                }).catch(error => (console.log(error), res.status(400).json({ message: error })));
            } else { return (console.log(err), res.status(400).json({ message: err })); }
          });
        } else { throw 'Email is already in use'; }
      }).catch(error => (console.log(error), res.status(400).json({ message: error })));
  } else if (!full_name) {
    return res.status(400).json({ message: 'User "full_name" is required' });
  } else if (!email) {
    return res.status(400).json({ message: 'User "email" is required' });
  } else if (!address) {
    return res.status(400).json({ message: 'User "address" is required' });
  } else if (!secret) {
    return res.status(400).json({ message: 'User "secret" is required' });
  } else if (!password) {
    return res.status(400).json({ message: 'User "password" is required' });
  } else if (!password) {
    return res.status(400).json({ message: '"hermes" object is required' });
  }
}

exports.setOwnership = (req, res, next) => {
  const user = req.user || req.body.user;
  const company = req.company || req.body.company;

  if (user && company) {
    Company.findById(company._id)
      .then(_company => {
        if (_company) {
          User.findById(user._id)
            .then(_user => {
              if (_user) {
                _company.owner = _user;
                _company.save()
                  .then(saved => {
                    Role.findOne({ title: 'owner' })
                      .then(role => {
                        if (role) {
                          _user.company = _company;
                          _user.role = role;
                          _user.save()
                            .then(saved => {
                              req.status = 200;
                              return next();
                            }).catch(error => (console.log(error), res.status(400).json({ message: error })));
                        } else { throw 'No owner role'; }
                      }).catch(error => (console.log(error), res.status(400).json({ message: error })));
                  }).catch(error => (console.log(error), res.status(400).json({ message: error })));
              } else { throw 'No user found'; }
            }).catch(error => (console.log(error), res.status(400).json({ message: error })));
        } else { throw 'No company found'; }
      }).catch(error => (console.log(error), res.status(400).json({ message: error })));
  } else if (!user) {
    return res.status(400).json({ message: '"user" object is required' });
  } else if (!company) {
    return res.status(400).json({ message: '"company" object is required' });
  }
}

exports.getAccount = (req, res, next) => {
  const email = req.params.email;

  User.findOne({ email })
    .populate({
      path: 'company',
      populate: [{
        path: 'hermes'
      }]
    })
    .populate('role')
    .then(user => {
      if (user) {
        req.status = 200;
        req.json = user;
        return next();
      } else { throw 'No user found'; }
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
}

exports.getAccounts = (req, res, next) => {
  const address = req.session.address;

  User.findOne({ address })
    .then(user => {
      if (user) {
        User.find({ company: user.company })
          .populate({
            path: 'company',
            populate: [
              { path: 'hermes' }
            ]
          })
          .populate('role')
          .then(users => {
            req.status = 200;
            req.json = {
              resultCount: users.length,
              data: users
            };
            return next();
          }).catch(error => (console.log(error), res.status(400).json({ message: error })));
      } else { throw 'No user found'; }
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
}

exports.getSettings = (req, res, next) => {
  const email = req.params.email;

  User.findOne({ email })
    .then(user => {
      if (user) {
        req.status = 200;
        req.json = user.settings;
        return next();
      } else { throw 'No accounts found'; }
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
}

exports.getNotifications = (req, res, next) => {}

exports.edit = (req, res, next) => {
  const email = req.params.email;
  const query = req.body;

  const update = {}
  const nowAllowedToChange = ['email', 'company', 'address', 'token'];
  for (const key in query) {
    if (nowAllowedToChange.indexOf(key) === -1) {
      update[key] = query[key]
    }
  }

  User.findOneAndUpdate({ email }, update)
    .then(updateResponse => {
      if (updateResponse) {
        req.status = 200;
        req.json = { message: 'Update data success' };
        return next();
      } else { throw 'Update data error'; }
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
}

exports.changePassword = (req, res, next) => {
  const email = req.body.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  if (email && oldPassword && newPassword) {
    User.findOne({ email })
      .then(user => {
        if (user) {
          const [address, secret] = utilsPassword.decrypt(user.token, oldPassword).split('|||');
          if (address && secret) {
            user.token = utilsPassword.encrypt(`${address}|||${secret}`, newPassword);
            user
              .save()
              .then(saved => {
                req.status = 200;
                req.json = {
                  message: 'Reset password success'
                };
                return next();
              }).catch(error => (console.log(error), res.status(400).json({ message: error })));
          } else { return res.status(401).json({ message: '"password" is incorrect' }); }
        } else { throw 'No user found'; }
      }).catch(error => (console.log(error), res.status(400).json({ message: error })));
  } else if (!email) {
    return res.status(400).json({ message: '"email" is required' });
  } else if (!oldPassword) {
    return res.status(400).json({ message: '"oldPassword" is required' });
  } else if (!newPassword) {
    return res.status(400).json({ message: '"newPassword" is required' });
  }
};
