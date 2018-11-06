/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');
const AccountController = _require('/controllers/account');
const AccountRoutes = express.Router();
const response = (req, res) => { res.status(req.status).json(req.json); };

AccountRoutes.route('/')
  .get(AccountController.getAccounts, response);

AccountRoutes.get('/exists/:address', AccountController.verifyAccount, response);

AccountRoutes.get('/permissions/:address', AccountController.getAccountPermissions, response);

AccountRoutes.post('/detail/secret', AccountController.getEncryptedPrivateKey, response);

AccountRoutes.route('/detail/:address')
  .get(AccountController.getAccountDetails, response)
  .put(AccountController.editAccountDetails, response);

AccountRoutes.route('/:address')
  .get(AccountController.getAccount, response)
  .put(AccountController.editAccount, response);

module.exports = AccountRoutes;
