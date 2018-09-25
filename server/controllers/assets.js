/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const axios = require('axios');

const Company = require('../models/companies');

exports.createAsset = (req, res, next) => {
  // Asset object with signature and assetId
  // already generated client side
  const asset = req.body.asset;
  const companyId = req.session.user.company._id;

  if (asset) {
    Company.findById(companyId)
      .populate('hermes')
      .then(company => {
        const headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        };

        axios.post(`${company.hermes.url}/assets`, asset, { headers })
          .then(assetCreated => {
            // Todo:
            // 1. Cache created asset in the db
            // 2. Increment assets created statistic on user and organization models

            req.status = 200;
            req.json = assetCreated;
            return next();
          }).catch(error => (console.log(error), res.status(400).json({ message: 'Asset creation failed', error })));
      }).catch(error => (console.log(error), res.status(400).json({ message: 'Company GET error', error })));
  } else if (!asset) {
    return res.status(400).json({ message: '"asset" object is required' })
  }
}

exports.getAsset = (req, res, next) => {
  const assetId = req.params.assetId;
  const token = req.query.token;
  const companyId = req.session.user.company._id;

  Company.findById(companyId)
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

exports.getAssets = (req, res, next) => {
  const { page, perPage, createdBy, fromTimestamp, toTimestamp, token } = req.query;
  const companyId = req.session.user.company._id;

  Company.findById(companyId)
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

exports.createEvent = (req, res, next) => {
  // Event object with signature, eventId and assetId
  // already generated client side
  const event = req.body.event;
  const companyId = req.session.user.company._id;

  if (event) {
    Company.findById(companyId)
      .populate('hermes')
      .then(company => {
        const headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        };

        axios.post(`${company.hermes.url}/events`, event, { headers })
          .then(eventCreated => {
            // Todo:
            // 1. Cache created event in the db
            // 2. Increment events created statistic on user and organization models

            req.status = 200;
            req.user = user;
            return next();
          }).catch(error => (console.log(error), res.status(400).json({ message: 'Event creation failed', error })));
      }).catch(error => (console.log(error), res.status(400).json({ message: 'Company GET error', error })));
  } else if (!event) {
    return res.status(400).json({ message: '"event" object is required' })
  }
}

exports.getEvent = (req, res, next) => {
  const eventId = req.params.eventId;
  const token = req.query.token;
  const companyId = req.session.user.company._id;

  Company.findById(companyId)
    .populate('hermes')
    .then(company => {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `AMB_TOKEN ${token}`
      };

      axios.get(`${company.hermes.url}/events/${eventId}`, { headers })
        .then(event => {
          // Todo:
          // 1. Cache the event

          req.status = 200;
          req.json = event;
          return next();
        })
        .catch(error => (console.log(error), res.status(400).json({ message: 'Event GET error', error })));
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Company GET error', error })));
}

exports.getEvents = (req, res, next) => {
  const { page, perPage, createdBy, fromTimestamp, toTimestamp, data, token } = req.query;
  const assetId = req.query.assetId || req.params.assetId;
  const companyId = req.session.user.company._id;

  Company.findById(companyId)
    .populate('hermes')
    .then(company => {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `AMB_TOKEN ${token}`
      };
      const url = `${company.hermes.url}/events?`;
      if (assetId) { url += `assetId=${assetId}&` }
      if (page) { url += `page=${page}&` }
      if (perPage) { url += `perPage=${perPage}&` }
      if (createdBy) { url += `createdBy=${createdBy}&` }
      if (fromTimestamp) { url += `fromTimestamp=${fromTimestamp}&` }
      if (toTimestamp) { url += `toTimestamp=${toTimestamp}&` }
      if (data) { url += `data=${data}` }

      axios.get(url, { headers })
        .then(events => {
          // Todo:
          // 1. Cache events

          req.status = 200;
          req.json = events;
          return next();
        })
        .catch(error => (console.log(error), res.status(400).json({ message: 'Events GET error', error })));
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Company GET error', error })));
}
