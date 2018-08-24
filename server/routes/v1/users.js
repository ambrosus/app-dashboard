/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const UsersController = require('../../controllers/users');
const UsersRoutes = express.Router();

// Routes
UsersRoutes.put('/password', UsersController.changePassword, (req, res) => { res.status(req.status).json(req.json); });
UsersRoutes.get('/company/:company', UsersController.getAccounts, (req, res) => { res.status(req.status).json(req.json); });
UsersRoutes.get('/settings/:address', UsersController.getSettings, (req, res) => { res.status(req.status).json(req.json); });
UsersRoutes.get('/:address', UsersController.getAccount, (req, res) => { res.status(req.status).json(req.json); });
UsersRoutes.put('/:address', UsersController.edit, (req, res) => { res.status(req.status).json(req.json); });

module.exports = UsersRoutes;
