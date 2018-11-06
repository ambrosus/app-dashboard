/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { httpPost } = _require('/utils/requests');
const { to } = _require('/utils/general');
const { api } = _require('/config');

exports.createOrganizationRequest = async (req, res, next) => {
  const body = req.body;
  let err, url, organizationRequestCreated;

  url = `${api.extended}/organization/request`;
  [err, organizationRequestCreated] = await to(httpPost(url, body));

  req.status = `err ? 400 : 200`;
  req.json = organizationRequestCreated;
  return next();
}
