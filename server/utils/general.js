/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

/* global Promise */

const axios = require('axios');

exports.get = (url, token = null) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) { headers['Authorization'] = `AMB_TOKEN ${token}`; }
  return new Promise((resolve, reject) => {
    axios.get(url, { headers, data: null })
      .then(resp => resolve(resp.data))
      .catch(error => reject(error.response));
  });
};

exports.create = (url, body, token = null) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) { headers['Authorization'] = `AMB_TOKEN ${token}`; }
  return new Promise((resolve, reject) => {
    axios.post(url, body, { headers, data: null })
      .then(resp => resolve(resp.data))
      .catch(error => reject(error.response));
  });
};
