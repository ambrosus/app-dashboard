/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

const express = require('express');

const checkAddress = require('../../middleware/checkAddress');
const checkPermission = require('../../middleware/checkPermission');

const UsersController = require('../../controllers/users');

const UsersRoutes = express.Router();

// Routes
UsersRoutes.route('/')
  .get(checkPermission('accounts'), UsersController.getAccounts, (req, res) => { res.status(req.status).json(req.json); })
  .post(UsersController.create, (req, res) => { res.status(req.status).json(req.json); });
UsersRoutes.put('/password', UsersController.changePassword, (req, res) => { res.status(req.status).json(req.json); });
UsersRoutes.get('/settings/:email', UsersController.getSettings, (req, res) => { res.status(req.status).json(req.json); });
UsersRoutes.route('/:email')
  .get(UsersController.getAccount, (req, res) => { res.status(req.status).json(req.json); })
  .put(checkAddress, UsersController.edit, (req, res) => { res.status(req.status).json(req.json); });
UsersRoutes.route(checkPermission('invites'), '/role').post(UsersController.assignRole, (req, res) => { res.status(req.status).json(req.json); })
UsersRoutes.route(checkPermission('invites'), '/editrole').post(UsersController.editRole, (req, res) => { res.status(req.status).json(req.json); });

module.exports = UsersRoutes;
