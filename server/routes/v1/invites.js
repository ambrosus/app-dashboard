/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const checkPermission = _require('/middleware/checkPermission');

const InvitesController = _require('/controllers/invites');

const InvitesRoutes = express.Router();

// Routes
InvitesRoutes.post('/', checkPermission('manage_accounts'), InvitesController.create, (req, res) => { res.status(req.status).json(req.json); });
InvitesRoutes.get('/company/:company', checkPermission('manage_accounts'), InvitesController.getAll, (req, res) => { res.status(req.status).json(req.json); });
InvitesRoutes.get('/verify/:token', InvitesController.verify, (req, res) => { res.status(req.status).json(req.json); });
InvitesRoutes.post('/delete', checkPermission('manage_accounts'), InvitesController.delete, (req, res) => { res.status(req.status).json(req.json); });

module.exports = InvitesRoutes;
