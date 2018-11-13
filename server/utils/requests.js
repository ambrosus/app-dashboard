/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const axios = require('axios');

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

exports.httpGet = (url, token = null) => {
  if (token) {
    headers['Authorization'] = `AMB_TOKEN ${token}`;
  }

  return new Promise((resolve, reject) => {
    axios
      .get(url, { headers, data: null })
      .then(resp => resolve(resp.data))
      .catch(error => reject(error.response));
  });
};

exports.httpDelete = (url, token = null) => {
  if (token) {
    headers['Authorization'] = `AMB_TOKEN ${token}`;
  }

  return new Promise((resolve, reject) => {
    axios
      .delete(url, { headers, data: null })
      .then(resp => resolve(resp.data))
      .catch(error => reject(error.response));
  });
};

exports.httpPost = (url, body, token = null) => {
  if (token) {
    headers['Authorization'] = `AMB_TOKEN ${token}`;
  }

  return new Promise((resolve, reject) => {
    axios
      .post(url, body, { headers, data: null })
      .then(resp => resolve(resp.data))
      .catch(error => reject(error.response));
  });
};

exports.httpPut = (url, body, token = null) => {
  if (token) {
    headers['Authorization'] = `AMB_TOKEN ${token}`;
  }

  return new Promise((resolve, reject) => {
    axios
      .put(url, body, { headers, data: null })
      .then(resp => resolve(resp.data))
      .catch(error => reject(error.response));
  });
};
