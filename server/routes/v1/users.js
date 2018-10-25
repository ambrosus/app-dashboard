/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const checkPermission = _require('/middleware/checkPermission');

const UsersController = _require('/controllers/users');
const InvitesController = _require('/controllers/invites');

const UsersRoutes = express.Router();

// UsersRoutes
UsersRoutes.route('/')
  .post(InvitesController.extract, UsersController.hermesAccountRegister, UsersController.create, (req, res) => { res.status(req.status).json(req.json); })
  .get(checkPermission('manage_accounts'), UsersController.getAccounts, (req, res) => { res.status(req.status).json(req.json); });

UsersRoutes.route('/:email')
  .get(UsersController.getAccount, (req, res) => { res.status(req.status).json(req.json); })
  .put(checkPermission(), UsersController.edit, (req, res) => { res.status(req.status).json(req.json); });

module.exports = UsersRoutes;
