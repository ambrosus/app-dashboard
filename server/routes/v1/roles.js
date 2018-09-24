/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const checkPermission = _require('/middleware/checkPermission');
const Roles = _require('/controllers/roles');

const routes = express.Router();

// Routes
routes.post('/', checkPermission('roles'), Roles.create, (req, res) => { res.status(req.status).json(req.json); });
routes.get('/', checkPermission('roles'), Roles.getRoles, (req, res) => { res.status(req.status).json(req.json); });

// Role
routes.put('/:_id', checkPermission('roles'), Roles.editRole, (req, res) => { res.status(req.status).json(req.json); });
routes.delete('/:_id', checkPermission('roles'), Roles.deleteRole, (req, res) => { res.status(req.status).json(req.json); });

module.exports = routes;
