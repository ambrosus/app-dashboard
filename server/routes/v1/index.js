/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');

const HermesesRoutes = require('./hermeses');
const CompaniesRoutes = require('./companies');
const AuthRoutes = require('./auth');
const UsersRoutes = require('./users');
const SetupRoutes = require('./setup');

const APIRoutes = express.Router();

APIRoutes.use('/hermeses', HermesesRoutes);
APIRoutes.use('/companies', CompaniesRoutes);
APIRoutes.use('/auth', AuthRoutes);
APIRoutes.use('/users', UsersRoutes);
APIRoutes.use('/setup', SetupRoutes);

module.exports = APIRoutes;
