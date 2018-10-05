/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

/* global _require */

const express = require('express');

const Role = _require('/models/roles');

const HermesesController = _require('/controllers/hermeses');
const CompaniesController = _require('/controllers/companies');
const UsersController = _require('/controllers/users');

const SetupRoutes = express.Router();

const initialSetup = (req, res, next) => {
  if (!req.body.user) {
    req.body.user = {};
  }

  req.body.user.accessLevel = 0;
  req.body.user.permissions = [
    'manage_accounts',
    'register_accounts',
    'create_asset',
    'create_event',
  ];

  const roles = [
    { title: 'owner', permissions: 'change_permissions, change_role, create_role' },
    { title: 'admin', permissions: 'create_role' },
    { title: 'user', permissions: '' },
  ];

  Role.create(roles)
    .then(() => { return next(); })
    .catch(error => res.status(400).json({ message: error }));

};

// Routes
SetupRoutes.post('/', initialSetup, HermesesController.create, CompaniesController.create, UsersController.create, UsersController.setOwnership,
  (req, res) => {

    req.locals.transaction.commitTransaction();
    res.status(req.status).json(req.json);
  });

module.exports = SetupRoutes;
