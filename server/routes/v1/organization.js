/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const OrganizationController = _require('/controllers/organization');
const OrganizationRoutes = express.Router();
const response = (req, res) => { res.status(req.status).json(req.json); };

OrganizationRoutes.route('/')
  .get(OrganizationController.getOrganizations, response);

OrganizationRoutes.route('/:organizationId')
  .get(OrganizationController.getOrganization, response)
  .put(OrganizationController.modifyOrganization, response);

OrganizationRoutes.get('/:organizationId/accounts', OrganizationController.getOrganizationAccounts, response);

OrganizationRoutes.route('/request')
  .post(OrganizationController.createOrganizationRequest, response);

module.exports = OrganizationRoutes;
