/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const utilsPassword = _require('/utils/password');
const mongoose = require('mongoose');
const config = _require('/config');
const axios = require('axios');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const web3 = new Web3();

const User = _require('/models/users');
const Company = _require('/models/companies');
const Role = _require('/models/roles');
const Invite = _require('/models/invites');

/**
 * Create a new user.
 *
 * @name createUser
 * @route {POST} api/users/
 * @bodyparam user: {email, accessLevel, permissions}, hermes
 * @returns Status code 400 on failure
 * @returns user Object on success with status code 200
 */
exports.create = (req, res, next) => {
  const user = req.body.user || {};
  const { full_name, address, token, password } = user;
  const hermes = req.hermes || req.body.hermes;
  const inviteToken = req.query.token;
  let email = user.email;
  let accessLevel = user.accessLevel || 1;
  let permissions = user.permissions || ['create_entity'];
  let company = '';

  // invite
  if (inviteToken) {
    try {
      const _token = JSON.parse(utilsPassword.decrypt(inviteToken, config.secret));
      email = _token['email'];
      accessLevel = _token['accessLevel'];
      company = _token['company'];
      role = _token['role']['_id'];
      if (_token['role']['title'] === 'admin') { permissions = ['register_account', 'create_entity'] }
    } catch (error) { return res.status(400).json({ message: 'Invite token is invalid' }); }
  }
  const query = { $or: [{ email }, { address }] };
  const _user = {
    full_name,
    email,
    address,
    token,
    password,
    company: mongoose.Types.ObjectId(company)
  };

  logger.info('User: ', _user);

  User.findOrCreate(query, _user)
    .then(({ doc, created }) => {
      if (created) {
        logger.info('User doc: ', doc, created);

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
        };
        axios.post(`${hermes.url}/accounts`, body, { headers })
          .then(userRegistered => {
            if (inviteToken) {
              Invite.findOneAndRemove({ token: inviteToken })
                .then(inviteDeleted => logger.info('Invite deleted'))
                .catch(error => logger.error('Invite delete error: ', error));
            }

            req.status = 200;
            req.user = doc;
            return next();
          }).catch(error => (logger.error(error), res.status(400).json({ message: 'Hermes error' })));
      } else { throw 'User exists'; }
    }).catch(error => (logger.error(error), res.status(400).json({ message: 'User creation error: ', error })));
}

/**
 * Sets company ownership
 *
 * @name setOwnership
 * @route {POST} api/setup
 * @bodyparam user, company
 * @returns Status code 400 on failure
 * @returns Status code 200 on success
 */
exports.setOwnership = (req, res, next) => {
  const user = req.user || req.body.user;
  const company = req.company || req.body.company;

  if (user && company) {
    User.findById(user._id)
      .then(_user => {
        Company.findByIdAndUpdate(company._id, { owner: user._id })
          .then(_saved => {
            req.status = 200;
            return next();
          }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
      }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
  } else if (!user) {
    return res.status(400).json({ message: '"user" object is required' });
  } else if (!company) {
    return res.status(400).json({ message: '"company" object is required' });
  }
}

/**
 * Get account details based on email address
 *
 * @name getAccount
 * @route {GET} api/users/
 * @returns Status code 400 on failure
 * @returns user Object on success with status code 200
 */
exports.getAccount = (req, res, next) => {
  const email = req.params.email;

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
        logger.info(user);
        req.status = 200;
        req.json = user;
        return next();
      } else { throw 'No user found'; }
    }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
}

/**
 * Get list of accounts based on the user's company
 *
 * @name getCompanyAccounts
 * @route {GET} api/users/
 * @returns Status code 400 on failure
 * @returns users Object & number of users (count) on success with status code 200
 */
exports.getAccounts = (req, res, next) => {
  const company = req.session.user.company || '';

  User.find({ company })
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
    .select('-password -__v')
    .then(users => {
      if (users) {
        req.status = 200;
        req.json = {
          resultCount: users.length,
          data: users
        };
        return next();
      } else { throw 'No users found'; }
    }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
}

/**
 * Get settings of a particular user (query using email address)
 *
 * @name getSettings
 * @route {GET} /settings/:email
 * @queryparam email
 * @returns Status code 400 on failure
 * @returns userSettings (user.settings) Object on success with status code 200
 */
exports.getSettings = (req, res, next) => {
  const email = req.params.email;

  User.findOne({ email })
    .then(user => {
      if (user) {
        req.status = 200;
        req.json = user.settings;
        return next();
      } else { throw 'No accounts found'; }
    }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
}

exports.getNotifications = (req, res, next) => {}

/**
 * Update user details using the user email address
 *
 * @name editUserDetails
 * @route {PUT} /users/:email
 * @queryparam email
 * @bodyparam userDetails: any
 * @returns Status code 400 on failure
 * @returns updateResponse Object on success with status code 200
 */
exports.edit = (req, res, next) => {
  const email = req.params.email;
  const query = req.body;

  const update = {}
  const allowedToChange = ['full_name', 'settings', 'profile'];
  for (const key in query) {
    if (allowedToChange.indexOf(key) > -1) {
      update[key] = query[key]
    }
  }

  User.findOneAndUpdate({ email }, update)
    .then(updateResponse => {
      if (updateResponse) {
        req.status = 200;
        req.json = { message: 'Update data success', data: updateResponse };
        return next();
      } else { throw 'Update data error'; }
    }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
}

/**
 * Change password of a user using their email address
 *
 * @name changePassword
 * @route {PUT} /users/password
 * @bodyparam email, oldPassword, newPassword
 * @returns Status code 400 on failure
 * @returns Password success message on success with status code 200
 */
exports.changePassword = (req, res, next) => {
  const { email, oldPassword, newPassword } = req.body;

  if (email && oldPassword && newPassword) {
    User.findOne({ email })
      .then(user => {
        if (user) {
          try {
            const decData = web3.eth.accounts.decrypt(JSON.parse(user.token), oldPassword);
            const encData = web3.eth.accounts.encrypt(decData.privateKey, newPassword);
            user.token = JSON.stringify(encData);
            bcrypt.hash(newPassword, 10, (err, hash) => {
              user.password = hash;
              User.updateOne({ email }, user)
                .then(updateResponse => {
                  if (updateResponse) {
                    req.status = 200;
                    req.json = { message: 'Password reset successful' };
                    return next();
                  } else { throw 'Error in updating password'; }
                }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
            });
          } catch (err) {
            throw 'Incorrect password';
          }
        } else { throw 'No user found with this email address'; }
      }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
  } else if (!email) {
    return res.status(400).json({ message: '"email" is required' });
  } else if (!oldPassword) {
    return res.status(400).json({ message: '"oldPassword" is required' });
  } else if (!newPassword) {
    return res.status(400).json({ message: '"newPassword" is required' });
  }
};

/**
 * Assign roles (role ObjectID) to users using their email address
 *
 * @name assignRole
 * @route {POST} api/users/role
 * @bodyparam email, role (Mongoose objectID)
 * @returns Status code 400 on failure
 * @returns Save success message on success with status code 200
 */
exports.assignRole = (req, res, next) => {
  const { email, role } = req.body

  if (email && role) {
    User.findOneAndUpdate({ email }, { role })
      .then(updateResponse => {
        if (updateResponse) {
          req.status = 200;
          req.json = { message: 'Role updated successfully', data: updateResponse };
          return next();
        } else { throw 'Update data error'; }
      }).catch(error => (logger.error(error), res.status(400).json({ message: error })));
  } else if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  } else if (!role) {
    return res.status(400).json({ message: 'Role ObjectID is required' });
  }

};
