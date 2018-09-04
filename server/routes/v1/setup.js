/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');

const Role = require('../../models/roles');

const HermesesController = require('../../controllers/hermeses');
const CompaniesController = require('../../controllers/companies');
const UsersController = require('../../controllers/users');

const SetupRoutes = express.Router();

initialSetup = (req, res, next) => {
  if (!req.body.user) { req.body.user = {} }
  req.body.user.accessLevel = 10;
  req.body.user.permissions = ['register_account', 'create_entity'];

  const roles = [
    { title: 'owner', id: 1 },
    { title: 'admin', id: 2 },
    { title: 'user', id: 3 }
  ];
  Role.insertMany(roles)
    .then(created => { return next(); })
    .catch(error => res.status(400).json({ message: error }));
}

// Routes
SetupRoutes.post('/', initialSetup, HermesesController.create, CompaniesController.create, UsersController.create, UsersController.setOwnership,
  (req, res) => { res.status(req.status).json(req.json); });

module.exports = SetupRoutes;
