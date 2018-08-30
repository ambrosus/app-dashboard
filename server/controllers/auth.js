/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const utilsPassword = require('../utils/password');
const axios = require('axios');
const bcrypt = require('bcrypt');

const User = require('../models/users');

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email && password) {
    User.findOne({ email })
      .populate({
        path: 'company',
        populate: [
          { path: 'hermes' }
        ]
      })
      .then(user => {
        if (user) {
          const valid = bcrypt.compareSync(password, user.password);

          if (valid) {
            const [address, secret] = utilsPassword.decrypt(user.token, password).split('|||');

            if (address && secret) {
              req.session.user = user;
              req.status = 200;
              req.json = {
                user,
                address,
                secret
              };
              return next();
            }
            return res.status(401).json({ message: 'User "password" is incorrect' });
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
          populate: [
            { path: 'hermes' }
          ]
        })
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
