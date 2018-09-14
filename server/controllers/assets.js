/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const axios = require('axios');

const Company = require('../models/companies');

exports.create = (req, res, next) => {
  // Asset object with signature and assetId
  // already generated client side
  const asset = req.body.asset;
  const hermes = req.body.hermes;

  if (asset && hermes) {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };

    axios.post(`${hermes.url}/assets`, asset, { headers })
      .then(assetCreated => {
        // Todo:
        // 1. Cache created asset in the db
        // 2. Increment assets created statistic on user and organization models

        req.status = 200;
        req.json = assetCreated;
        return next();
      }).catch(error => (console.log(error), res.status(400).json({ message: 'Asset creation failed', error })));
  } else if (!asset) {
    return res.status(400).json({ message: '"asset" object is required' })
  } else if (!hermes) {
    return res.status(400).json({ message: '"hermes" object is required' })
  }
}

exports.get = (req, res, next) => {
  const assetId = req.params.assetId;
  const token = req.query.token;
  const company = req.session.user.company;

  Company.findById(company._id)
    .populate('hermes')
    .then(company => {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `AMB_TOKEN ${token}`
      };

      axios.get(`${company.hermes.url}/assets/${assetId}`, { headers })
        .then(asset => {
          // Todo:
          // 1. Cache the asset

          req.status = 200;
          req.json = asset;
          return next();
        })
        .catch(error => (console.log(error), res.status(400).json({ message: 'Asset GET error', error })));
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Company GET error', error })));
}

exports.find = (req, res, next) => {
  const page = req.query.page;
  const perPage = req.query.perPage;
  const createdBy = req.query.createdBy;
  const fromTimestamp = req.query.fromTimestamp;
  const toTimestamp = req.query.toTimestamp;
  const token = req.query.token;
  const company = req.session.user.company;

  Company.findById(company._id)
    .populate('hermes')
    .then(company => {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `AMB_TOKEN ${token}`
      };
      const url = `${company.hermes.url}/assets?`;
      if (page) { url += `page=${page}&` }
      if (perPage) { url += `perPage=${perPage}&` }
      if (createdBy) { url += `createdBy=${createdBy}&` }
      if (fromTimestamp) { url += `fromTimestamp=${fromTimestamp}&` }
      if (toTimestamp) { url += `toTimestamp=${toTimestamp}` }

      axios.get(url, { headers })
        .then(assets => {
          // Todo:
          // 1. Cache assets

          req.status = 200;
          req.json = assets;
          return next();
        })
        .catch(error => (console.log(error), res.status(400).json({ message: 'Assets GET error', error })));
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Company GET error', error })));
}
