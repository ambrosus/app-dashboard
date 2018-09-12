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
 * @route {POST} api/roles/
 * @bodyparam 
 *      - title (e.g: { title: 'owner' }), 
 *      - permissionsArray (e.g: { permissionsArray: "string1, string2" }),
 *      - id: Number
 * @returns Status code 400 on failure
 * @returns New role saved successfully message on success with status code 200
 */
exports.create = (req, res, next) => {
  const role = new Role();

  const title = req.body.title;
  const id = req.body.id;
  const permissionsArray = req.body.permissionsArray;

  if (title && id && permissionsArray) {
    role._id = new mongoose.Types.ObjectId(),
    role.title = req.body.title;
    role.id = req.body.id;
    role.permissionsArray = req.body.permissionsArray;
    role.createdBy = req.session.user._id;
    role.save()
      .then(saveResponse => {
        req.status = 200;
        req.json = { message: 'New role saved successfully' };
        return next();
      })
      .catch(error => (console.log(error), res.status(400).json({ message: error })));
  } else if (!title) {
    return res.status(400).json({ message: 'Role "title" is required' });
  } else if (!id) {
    return res.status(400).json({ message: 'Role "id" is required' });
  } else if (!permissionsArray) {
    return res.status(400).json({ message: 'Role "permissionsArray" is required' });
  }

};

/**
 * User can edit the permissionsArray for a particular role ID 
 *
 * @name editPermissions
 * @route {PUT} api/roles/permissions
 * @bodyparam roleID, permissionsArray (e.g: { permissionsArray: "string1, string2" })
 * @returns Status code 400 on failure
 * @returns Permissions updated message on success with status code 200
 */
exports.editPermissions = (req, res, next) => {
  const update = {};
  const _id = req.body._id;
  update.permissionsArray = req.body.permissionsArray;

  if (_id && update.permissionsArray) {
    Role.findOneAndUpdate({ _id }, update)
      .then(updateResponse => {
        if (updateResponse) {
          req.status = 200;
          req.json = { message: 'Permissions updated successfully' }
          return next();
        }
      })
  } else if (!_id) {
    return res.status(400).json({ message: 'Role "_id" is required' });
  } else if (!update.permissionsArray) {
    return res.status(400).json({ message: 'Role "permissionsArray" is required' });
  }

};
