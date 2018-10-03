/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

const Role = _require('/models/roles');

/**
 * This route allows you to create a new Role and add a set of permissions to them
 *
 * @name createRole
 * @route {POST} api/users/roles
 * @bodyparam
 *      - title (e.g: { title: 'owner' }),
 *      - permissions (e.g: { permissions: "string1, string2" }),
 * @returns Status code 400 on failure
 * @returns New role saved successfully message on success with status code 200
 */
exports.create = (req, res, next) => {
  const { title, permissions } = req.body;

  Role.create({
      title,
      permissions,
      createdBy: req.session.user._id,
      company: req.session.user.company,
    }).then(role => {
      req.status = 200;
      req.json = role;
      return next();
    })
    .catch(error => (logger.error(error), res.status(400).json({ message: 'Role create error' })));
};

/**
 * This route allows you to edit a Role
 *
 * @name editRole
 * @route {PUT} api/users/role/:id
 * @routeparam
 *      - id (e.g: /1),
 * @bodyparam
 *      - title (e.g: { title: 'owner' }),
 *      - permissions (e.g: { permissions: "string1, string2" }),
 * @returns Status code 400 on failure
 * @returns Changed role successfully message on success with status code 200
 */
exports.editRole = (req, res, next) => {
  const { _id } = req.params;
  const { title, permissions } = req.body;

  Role.findByIdAndUpdate({ _id }, { title, permissions }, { new: true })
    .then(role => {
      logger.info(role);

      if (role) {
        req.status = 200;
        req.json = role;
        return next();
      }
    }).catch(error => (logger.error(error), res.status(400).json({ message: 'Role edit error' })));
};

/**
 * This route allows you to delete a Role
 *
 * @name deleteRole
 * @route {PUT} api/users/role/:id
 * @routeparam
 *      - id (e.g: /1)
 * @returns Status code 400 on failure
 * @returns Deleted role successfully message on success with status code 200
 */
exports.deleteRole = (req, res, next) => {
  const { _id } = req.params;
  logger.info(_id);

  Role.findByIdAndRemove({ _id })
    .then(role => {
      if (role) {
        req.status = 200;
        req.json = { message: 'Role deleted successfully' };
        return next();
      }
    }).catch(error => (logger.error(error), res.status(400).json({ message: 'Role delete error' })));
};

/**
 * Fetch all Roles that exists in the Roles collection
 *
 * @name getRoles
 * @route {GET} api/users/roles
 * @returns Status code 400 on failure
 * @returns Roles array on success with status code 200
 */
exports.getRoles = (req, res, next) => {
  const company = req.session.user.company;
  Role.find({ company })
    .then(roles => {
      req.status = 200;
      req.json = roles;
      return next();
    }).catch(error => (logger.error(error), res.status(400).json({ message: 'Roles GET error' })));

};
