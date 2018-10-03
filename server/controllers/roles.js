/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { to } = _require('/utils/general');
const { ValidationError } = _require('/errors');

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
exports.create = async (req, res, next) => {
  const { title, permissions } = req.body;
  let err, role;

  [err, role] = await to(
    Role.create({
      title,
      permissions,
      createdBy: req.session.user._id,
      company: req.session.user.company
    })
  );
  if (err || !role) { logger.error('Role create error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: role, message: 'Success', status: 200 };
  return next();
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
exports.editRole = async (req, res, next) => {
  const { _id } = req.params;
  const { title, permissions } = req.body;
  let err, role;

  [err, role] = await to(Role.findByIdAndUpdate({ _id }, { title, permissions }, { new: true }));
  if (err || !role) { logger.error('Role update error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: role, message: 'Success', status: 200 };
  return next();
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
exports.deleteRole = async (req, res, next) => {
  const { _id } = req.params;
  let err, role;

  [err, role] = await to(Role.findByIdAndRemove({ _id }));
  if (err || !role) { logger.error('Role delete error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: role, message: 'Success', status: 200 };
  return next();
};

/**
 * Fetch all Roles that exists in the Roles collection
 *
 * @name getRoles
 * @route {GET} api/users/roles
 * @returns Status code 400 on failure
 * @returns Roles array on success with status code 200
 */
exports.getRoles = async (req, res, next) => {
  const company = req.session.user.company;
  let err, roles;

  [err, roles] = await to(Role.paginate({ company }));
  if (err || !roles) { logger.error('Role GET error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: roles, message: 'Success', status: 200 };
  return next();
};
