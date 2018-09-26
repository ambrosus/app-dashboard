/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');

const HermesesController = _require('/controllers/hermeses');

const HermesesRoutes = express.Router();

// Routes
HermesesRoutes.route('/')
  .get(HermesesController.getAll, (req, res) => { res.status(req.status).json(req.json); });

module.exports = HermesesRoutes;
