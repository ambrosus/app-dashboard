/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { httpGet, httpPost, httpPut } = _require('/utils/requests');
const { to } = _require('/utils/general');
const { api } = _require('/config');

// Accounts

exports.getAccounts = async (req, res, next) => {
  const token = req.query.token;
  let err, url, accounts;

  url = `${api.extended}/account`;
  [err, accounts] = await to(httpGet(url, token));

  req.status = `err ? 400 : 200`;
  req.json = accounts;
  return next();
}
exports.verifyAccount = async (req, res, next) => {
  const address = req.params.address;
  let err, url, account;

  url = `${api.extended}/account/exists/${address}`;
  [err, account] = await to(httpGet(url));

  req.status = `err ? 400 : 200`;
  req.json = account;
  return next();
}

exports.getEncryptedPrivateKey = async (req, res, next) => {
  const body = req.body;
  let err, url, privateKey;

  url = `${api.extended}/account/detail/secret`;
  [err, privateKey] = await to(httpPost(url, body));

  req.status = `err ? 400 : 200`;
  req.json = privateKey;
  return next();
}

exports.getAccountPermissions = async (req, res, next) => {
  const address = req.params.address;
  const token = req.query.token;
  let err, url, accountPermissions;

  url = `${api.extended}/account/permissions/${address}`;
  [err, accountPermissions] = await to(httpGet(url, token));

  req.status = `err ? 400 : 200`;
  req.json = accountPermissions;
  return next();
}

exports.getAccount = async (req, res, next) => {
  const address = req.params.address;
  const token = req.query.token;
  let err, url, account;

  url = `${api.extended}/account/${address}`;
  [err, account] = await to(httpGet(url, token));

  req.status = `err ? 400 : 200`;
  req.json = account;
  return next();
}

exports.editAccount = async (req, res, next) => {
  const address = req.params.address;
  const token = req.query.token;
  const body = req.body;
  let err, url, accountEdited;

  url = `${api.core}/accounts/${address}`;
  [err, accountEdited] = await to(httpPut(url, body, token));

  req.status = `err ? 400 : 200`;
  req.json = accountEdited;
  return next();
}

// Account details

exports.getAccountDetails = async (req, res, next) => {
  const address = req.params.address;
  const token = req.query.token;
  let err, url, accountDetails;

  url = `${api.extended}/account/detail/${address}`;
  [err, accountDetails] = await to(httpGet(url, token));

  req.status = `err ? 400 : 200`;
  req.json = accountDetails;
  return next();
}

exports.editAccountDetails = async (req, res, next) => {
  const address = req.params.address;
  const token = req.query.token;
  const body = req.body;
  let err, url, accountEdited;

  url = `${api.extended}/account/detail/${address}`;
  [err, accountEdited] = await to(httpPut(url, body, token));

  req.status = `err ? 400 : 200`;
  req.json = accountEdited;
  return next();
}
