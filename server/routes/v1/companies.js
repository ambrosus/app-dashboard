/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const CompaniesController = _require('/controllers/companies');

const CompaniesRoutes = express.Router();

// Routes
CompaniesRoutes.post('/', CompaniesController.create, (req, res) => { res.status(req.status).json(req.json); });
CompaniesRoutes.put('/', CompaniesController.edit, (req, res) => { res.status(req.status).json(req.json); });
CompaniesRoutes.get('/check', CompaniesController.check, (req, res) => { res.status(req.status).json(req.json); });

module.exports = CompaniesRoutes;
