/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

const utilsPassword = require('../utils/password');

const User = require('../models/users');

exports.getAccount = (req, res, next) => {
  const address = req.params.address;

  if (address) {
    const query = { address };

    User.findOne(query)
      .populate({
        path: 'company',
        populate: [
          { path: 'hermes' }
        ]
      })
      .populate('role')
      .then(user => {
        if (user) {
          req.status = 200;
          req.json = user;
          return next();
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
    req.json = { message: '"address" is required' };
    return next();
  }
}

exports.getAccounts = (req, res, next) => {
  const company = req.params.company;

  if (company) {
    const query = { company };

    User.find(query)
      .then(users => {
        if (users) {
          req.status = 200;
          req.json = users;
          return next();
        } else {
          throw 'No accounts found';
        }
      })
      .catch(error => {
        req.status = 400;
        req.json = { message: error };
        return next();
      });
  } else if (!company) {
    req.status = 400;
    req.json = { message: '"company" is required' };
    return next();
  }

}

exports.getSettings = (req, res, next) => {

  const email = req.query.email;
  const address = req.query.address;

  const query = email ? { email } : { address }

  if (query) {
    User.findOne(query)
      .then(response => {
        if (response) {
          req.status = 200;
          req.json = response.settings;
          return next();
        } else {
          throw 'No accounts found';
        }
      })
      .catch(error => {
        req.status = 400;
        req.json = { message: error };
        return next();
      });
  } else if (!query) {
    req.status = 400;
    req.json = { message: '"email or address" is required' };
    return next();
  }
}

exports.getNotifications = (req, res, next) => {

}

exports.edit = (req, res, next) => {
  const email = req.params.email;
  const query = req.body;
  const update = {}

  for (const key in query) {
    if (key === 'full_name' || key === 'settings') {
      update[key] = query[key]
    }
  }

  if(email) {
    User.findOneAndUpdate({ email }, update)
    .then(updateResponse => {
      if (updateResponse) {
        req.status = 200;
        req.json = { message: 'Update data success' };
        return next();
      }
      req.status = 400;
      req.json = { message: 'Update data error' };
      return next();
    })
    .catch(error => {
      req.status = 400;
      req.json = { message: 'Update data error' };
      return next();
    });
  } else {
    req.status = 400;
    req.json = { message: '"email" is required' };
    return next();
  }
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
                req.json = { message: 'Reset password success' };
                return next();
              })
              .catch(error => {
                req.status = 400;
                req.json = { message: 'Reset password failed' };
                return next();
              });
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
  } else if (!email) {
    req.status = 400;
    req.json = { message: '"email" is required' };
    return next();
  } else if (!oldPassword) {
    req.status = 400;
    req.json = { message: '"oldPassword" is required' };
    return next();
  } else if (!newPassword) {
    req.status = 400;
    req.json = { message: '"newPassword" is required' };
    return next();
  }
};
