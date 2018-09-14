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
  // Event object with signature, eventId and assetId
  // already generated client side
  const event = req.body.event;
  const hermes = req.body.hermes;

  if (event && hermes) {

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };

    axios.post(`${hermes.url}/events`, event, { headers })
      .then(eventCreated => {
        // Todo:
        // 1. Cache created event in the db
        // 2. Increment events created statistic on user and organization models

        req.status = 200;
        req.user = user;
        return next();
      }).catch(error => (console.log(error), res.status(400).json({ message: 'Event creation failed', error })));
  } else if (!event) {
    return res.status(400).json({ message: '"event" object is required' })
  } else if (!hermes) {
    return res.status(400).json({ message: '"hermes" object is required' })
  }
}

exports.get = (req, res, next) => {
  const eventId = req.params.eventId;
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

exports.find = (req, res, next) => {
  const assetId = req.query.assetId;
  const page = req.query.page;
  const perPage = req.query.perPage;
  const createdBy = req.query.createdBy;
  const fromTimestamp = req.query.fromTimestamp;
  const toTimestamp = req.query.toTimestamp;
  const data = req.query.data;
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
