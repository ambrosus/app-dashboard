/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

const utilsPassword = require('../utils/password');

const User = require('../models/users');

exports.create = (req, res, next) => {
  const full_name = req.body.full_name;
  const email = req.body.email;
  const address = req.body.address;
  const password = req.body.password;
  const secret = req.body.secret;

  if (full_name && email && address) {

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
  } else if (!address) {
    req.status = 400;
    req.json = { message: '"address" is required' };
    return next();
  }

}

exports.getAccount = (req, res, next) => {
  const email = req.params.email;

  User.findOne({ email })
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
      }).catch(error => {
        req.status = 400;
        req.json = { message: error };
        return next();
      });
    } else {
      throw 'No user found';
    }
  })
  .catch(error => {
    req.status = 400;
    req.json = { message: error };
    return next();
  });
}

exports.getSettings = (req, res, next) => {
  const email = req.params.email;

  User.findOne({ email })
  .then(user => {
    if (user) {
      req.status = 200;
      req.json = user.settings;
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
