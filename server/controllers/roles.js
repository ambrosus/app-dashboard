/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const Role = require('../models/roles');

exports.create = (req, res, next) => {
    console.log('ROLES');
    req.status = 200;
    req.json = { message: 'Create roles successful' };
    next();
};

exports.editRole = (req, res, next) => { };

