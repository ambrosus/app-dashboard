/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { httpPost, httpGet, httpPut } = _require('/utils/requests');
const { to } = _require('/utils/general');
const { api } = _require('/config');

exports.getOrganizations = async (req, res, next) => {
  const { token, next: _next } = req.query;
  let err, url, organizations;

  url = `${api.extended}/organization?next=${_next}`;
  [err, organizations] = await to(httpGet(url, token));

  req.status = `${err ? 400 : 200}`;
  req.json = err || organizations;
  return next();
}

exports.getOrganization = async (req, res, next) => {
  const organizationId = req.params.organizationId;
  const token = req.query.token;
  let err, url, organization;

  url = `${api.extended}/organization/${organizationId}`;
  [err, organization] = await to(httpGet(url, token));

  req.status = `${err || organization.meta.code === 400 ? 400 : 200}`;
  req.json = err || organization;
  return next();
}

exports.getOrganizationAccounts = async (req, res, next) => {
  const organizationId = req.params.organizationId;
  const token = req.query.token;
  let err, url, organizationAccounts;

  url = `${api.extended}/organization/${organizationId}/accounts`;
  [err, organizationAccounts] = await to(httpGet(url, token));

  req.status = `${err ? 400 : 200}`;
  req.json = err || organizationAccounts;
  return next();
}

exports.modifyOrganization = async (req, res, next) => {
  const organizationId = req.params.organizationId;
  const token = req.query.token;
  const body = req.body;
  let err, url, organizationEdited;

  url = `${api.extended}/organization/${organizationId}`;

  [err, organizationEdited] = await to(httpPut(url, body, token));

  req.status = `${err ? 400 : 200}`;
  req.json = err || organizationEdited;
  return next();
}

// Organization requests

exports.createOrganizationRequest = async (req, res, next) => {
  const body = req.body;
  let err, url, organizationRequestCreated;

  url = `${api.extended}/organization/request`;
  [err, organizationRequestCreated] = await to(httpPost(url, body));

  req.status = `${err ? 400 : 200}`;
  req.json = err || organizationRequestCreated;
  return next();
}
