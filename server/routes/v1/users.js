/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

const express = require('express');

const checkAddress = _require('/middleware/checkAddress');
const checkPermission = _require('/middleware/checkPermission');

const UsersController = _require('/controllers/users');
const RolesController = _require('/controllers/roles');

const routes = express.Router();

// Roles sub-route 
routes.route('/roles')
  .get(RolesController.getRoles, (req, res) => { res.status(req.status).json(req.json); })
  .post(checkPermission('roles'), RolesController.create, (req, res) => { res.status(req.status).json(req.json); });

routes.route('/role/:_id')
  .put(checkPermission('roles'), RolesController.editRole, (req, res) => { res.status(req.status).json(req.json); })
  .delete(checkPermission('roles'), RolesController.deleteRole, (req, res) => { res.status(req.status).json(req.json); });

// Routes
routes.route('/')
  .get(UsersController.getAccounts, (req, res) => { res.status(req.status).json(req.json); })
  .post(UsersController.create, (req, res) => { res.status(req.status).json(req.json); });
routes.put('/password', UsersController.changePassword, (req, res) => { res.status(req.status).json(req.json); });
routes.get('/settings/:email', UsersController.getSettings, (req, res) => { res.status(req.status).json(req.json); });
routes.route('/:email')
  .get(UsersController.getAccount, (req, res) => { res.status(req.status).json(req.json); })
  .put(checkAddress, UsersController.edit, (req, res) => { res.status(req.status).json(req.json); });
routes.route(checkPermission('invites'), '/role').post(UsersController.assignRole, (req, res) => { res.status(req.status).json(req.json); })

module.exports = routes;
