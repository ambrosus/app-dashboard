/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const checkPermission = require('../../middleware/checkPermission');

const InvitesController = require('../../controllers/invites');

const InvitesRoutes = express.Router();

// Routes
InvitesRoutes.post('/', checkPermission('invites'), InvitesController.create, (req, res) => { res.status(req.status).json(req.json); });
InvitesRoutes.get('/company/:company', checkPermission('invites'), InvitesController.getAll, (req, res) => { res.status(req.status).json(req.json); });
InvitesRoutes.get('/verify/:token', InvitesController.verify, (req, res) => { res.status(req.status).json(req.json); });
InvitesRoutes.post('/delete', checkPermission('invites'), InvitesController.delete, (req, res) => { res.status(req.status).json(req.json); });

module.exports = InvitesRoutes;
