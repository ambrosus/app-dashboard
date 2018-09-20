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
 * @name createRole
 * @route {POST} api/roles
 * @bodyparam 
 *      - title (e.g: { title: 'owner' }), 
 *      - permissions (e.g: { permissions: "string1, string2" }),
 * @returns Status code 400 on failure
 * @returns New role saved successfully message on success with status code 200
 */
exports.create = (req, res, next) => {
  const title = req.body.title;
  const permissions = req.body.permissions;
  const role = new Role({
    _id: new mongoose.Types.ObjectId(),
    title,
    permissions,
    createdBy: req.session.user._id,
    company: req.session.user.company
  });
  role.save()
    .then(saveResponse => {
      req.status = 200;
      req.json = { message: 'New role saved successfully' };
      return next();
    })
    .catch(error => (console.log(error), res.status(400).json({ message: error })));
};

/**
 * This route allows you to edit a Role
 *
 * @name editRole
 * @route {PUT} api/roles
 * @bodyparam 
 *      - _id
 *      - title (e.g: { title: 'owner' }), 
 *      - permissions (e.g: { permissions: "string1, string2" }),
 * @returns Status code 400 on failure
 * @returns New role saved successfully message on success with status code 200
 */
exports.edit = (req, res, next) => {
  const _id = req.body._id;
  const title = req.body.title;
  const permissions = req.body.permissions;

  Role.updateOne({ _id }, {title, permissions})
    .then(updateResponse => {
      if (updateResponse) {
        req.status = 200;
        req.json = { message: 'Permissions updated successfully' }
        return next();
      }
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
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
  const company = req.session.user.company;
  Role.find({company})
    .then(roles => {
      req.status = 200;
      req.json = roles;
      return next();
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
};
