/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const checkPermission = _require('/middleware/checkPermission');

const OrganizationsController = _require('/controllers/organizations');
const UsersController = _require('/controllers/users');

const OrganizationsRoutes = express.Router();

// Routes
OrganizationsRoutes.route('/')
  .get(checkPermission('super_account'), OrganizationsController.getAll, (req, res) => { res.status(req.status).json(req.json); });
OrganizationsRoutes.route('/request')
  .get(checkPermission('super_account'), OrganizationsController.getOrganizationRequests, (req, res) => { res.status(req.status).json(req.json); })
  .post(OrganizationsController.organizationRequest, (req, res) => { res.status(req.status).json(req.json); })
  .put(checkPermission('super_account'), OrganizationsController.organizationRequestApproval, (req, res) => { res.status(req.status).json(req.json); });
OrganizationsRoutes.get('/check/:title', OrganizationsController.check, (req, res) => { res.status(req.status).json(req.json); });
OrganizationsRoutes.route('/:organizationID')
  .put(checkPermission('manage_organization'), OrganizationsController.edit, (req, res) => { res.status(req.status).json(req.json); });

module.exports = OrganizationsRoutes;
