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
  const { token, next: _next } = req.query;
  let err, url, accounts;

  url = `${api.extended}/account?next=${_next}`;
  [err, accounts] = await to(httpGet(url, token));

  req.status = `${err ? 400 : 200}`;
  req.json = err || accounts;
  return next();
}

exports.getAccount = async (req, res, next) => {
  const address = req.params.address;
  const token = req.query.token;
  let err, url, account;

  url = `${api.extended}/account/${address}`;
  [err, account] = await to(httpGet(url, token));

  req.status = `${err ? 400 : 200}`;
  req.json = err || account;
  return next();
}

exports.editAccount = async (req, res, next) => {
  const address = req.params.address;
  const token = req.query.token;
  const body = req.body;
  let err, url, accountEdited;

  url = `${api.extended}/account/${address}`;

  if (body.accessLevel || body.permissions) {
    url = `${api.core}/accounts/${address}`;
  }
  [err, accountEdited] = await to(httpPut(url, body, token));

  req.status = `${err ? 400 : 200}`;
  req.json = err || accountEdited;
  return next();
}

exports.getEncryptedPrivateKey = async (req, res, next) => {
  const body = req.body;
  let err, url, privateKey;

  url = `${api.extended}/account/secret`;
  [err, privateKey] = await to(httpPost(url, body));

  // Alter when it gets fixed
  req.status = `${err || (privateKey.meta && privateKey.meta.code === 400) ? 400 : 200}`;
  req.json = err || privateKey;
  return next();
}

exports.verifyAccount = async (req, res, next) => {
  const address = req.params.address;
  let err, url, account;

  url = `${api.extended}/account/${address}/exists`;
  [err, account] = await to(httpGet(url));

  req.status = `${err || !(account.meta && account.meta.exists) ? 400 : 200}`;
  req.json = err || account;
  return next();
}
