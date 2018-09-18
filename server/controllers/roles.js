/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const Role = require('../models/roles');

/**
 * This route allows you to create a new Role and add a set of permissions to them
 *
 * @name createOrEditRole
 * @route {PUT} api/roles
 * @bodyparam 
 *      - title (e.g: { title: 'owner' }), 
 *      - permissions (e.g: { permissions: "string1, string2" }),
 * @returns Status code 400 on failure
 * @returns New role saved successfully message on success with status code 200
 */
exports.create = (req, res, next) => {
  const _id = req.body._id;
  const title = req.body.title;
  const permissions = req.body.permissions;

  if (_id && title && permissions) {

    Role.findOneAndUpdate({ _id }, {title: title, permissions: permissions})
      .then(updateResponse => {
        if (updateResponse) {
          req.status = 200;
          req.json = { message: 'Permissions updated successfully' }
          return next();
        }
      }).catch(error => (console.log(error), res.status(400).json({ message: error })));

  } else if (!_id && title && permissions) {
    const role = new Role({
      _id: new mongoose.Types.ObjectId(),
      title,
      permissions,
      createdBy: req.session.user._id
    });
    role.save()
      .then(saveResponse => {
        req.status = 200;
        req.json = { message: 'New role saved successfully' };
        return next();
      })
      .catch(error => (console.log(error), res.status(400).json({ message: error })));
  } else if (!title) {
    return res.status(400).json({ message: 'Role "title" is required' });
  } else if (!permissions) {
    return res.status(400).json({ message: 'Role "permissions" is required' });
  }

};

/**
 * Fetch all Roles that exists in the Roles collection
 *
 * @name getRoles
 * @route {GET} api/roles
 * @returns Status code 400 on failure
 * @returns Roles array on success with status code 200
 */
exports.getRoles = (req, res, next) => {
  Role.find()
    .then(roles => {
      if (roles) {
        req.status = 200;
        req.json = roles;
        return next();
      } else {
        return res.status(400).json({ message: 'No roles found' });
      }
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
};
