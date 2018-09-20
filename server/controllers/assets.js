/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const axios = require('axios');

const Asset = require('../models/assets');
const assetsUtils = require('../utils/assets');

const get = (url, token) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) { headers['Authorization'] = `AMB_TOKEN ${token}`; }
  return axios.get(url, { headers });
}

const create = (url, body, token) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) { headers['Authorization'] = `AMB_TOKEN ${token}`; }
  return axios.post(url, body, { headers });
}

/**
 * 1. Gets new assets from Hermes
 * 2. Inserts assets into dash db
 * 3. Calls next();
 *
 * @name getAssets
 * @route { GET } api/assets/
 * @param { String } page - pagination page to get
 * @param { String } perPage - assets perPage to get
 * @param { String } token - for getting public and private assets/events
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getAssets = (req, res, next) => {
  const { page, perPage, token } = req.query;
  const user = req.session.user;
  const hermesURL = user.company.hermes.url;

  Asset.paginate({}, { limit: 1 })
    .then(assets => {
      let url = `${hermesURL}/assets?createdBy=${user.address}&perPage=500&`;
      url += `fromTimestamp=${assets[0].updatedAt}`;

      // GET assets from Hermes
      get(url, token)
        .then(assets => {

          // Insert assets to db
          const insertAssets = new Promise((resolve, reject) => {
            assets.results.forEach((asset, index, array) => {
              const _asset = new Asset({
                _id: new mongoose.Types.ObjectId(),
                assetId: asset.assetId,
                createdBy: asset.content.idData.createdBy,
                updatedAt: asset.content.idData.timestamp,
                createdAt: asset.content.idData.timestamp
              });

              _asset.save()
                .then(inserted => { if (index === array.length - 1) { resolve(); } })
                .catch(error => {
                  console.log('Cached asset creation error: ', error);
                  if (index === array.length - 1) { resolve(); }
                });
            });
          });

          // GET cached assets
          insertAssets.then(() => {
            Asset.paginate({}, { page, limit: perPage, sort: '-createdAt' })
              .then(assets => {
                req.status = 200;
                req.json = { assets };
                next();
              }).catch(error => (console.log(error), res.status(400).json({ message: 'Cached Assets GET error', error })));
          });
        }).catch(error => (console.log(error), res.status(400).json({ message: 'Assets GET error', error })));
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Cached Asset GET error', error })));
}

/**
 * 1. req.json.assets.docs loop, for each asset,
 *    gets and sets asset's updatedAt and latestEvent properties,
 * 2. on success, gets and sets asset's infoEvent property
 * 3. Makes an update of each cached asset
 * 4. Calls next();
 *
 * @name updateCachedAssets
 * @route { GET } api/assets/
 * @param { String } token - for getting public and private assets/events
 * @param { Object } session - logged in user session
 * @param { Object } req.json.assets - Assets (pagination result) previous method forwaded
 * @returns 200 and next() on success
 */
exports.updateCachedAssets = (req, res, next) => {
  const { token } = req.query;
  const hermesURL = req.session.user.company.hermes.url;
  const assets = req.json.assets;

  if (assets) {
    // Get all events and choose latestEvent, and get latest info event
    const getAssetEventsAndUpdate = new Promise((resolve, reject) => {
      assets.docs.forEach((asset, index, array) => {
        url = `${hermesURL}/events?assetId=${asset.assetId}&perPage=500`;

        // Get all events and choose latestEvent
        get(url, token)
          .then(resp => {
            asset.updatedAt = resp.results[0].content.idData.timestamp;
            asset.latestEvent = JSON.stringify(assetsUtils.findEvent('latest', resp.results));

            // Get info event
            url = `${hermesURL}/events?assetId=${asset.assetId}&perPage=1&`;
            url += `data[type]=ambrosus.asset.info`;
            get(url, token)
              .then(resp => {
                asset.infoEvent = JSON.stringify(assetsUtils.findEvent('info', resp.results));

                // Update the asset
                Asset.findByIdAndUpdate(asset._id, asset)
                  .then(assetUpdated => { if (index === array.length - 1) { resolve(); } })
                  .catch(error => {
                    console.log('Asset update error: ', error);
                    if (index === array.length - 1) { resolve(); }
                  });
              }).catch(error => (console.log('Asset info event GET error: ', error)));
          }).catch(error => (console.log('Asset events GET error: ', error)));
      });
    });

    getAssetEventsAndUpdate.then(() => next());
  } else {
    req.status = 400;
    req.json['message'] = '"assets" object is required to update cached assets';
    return next();
  }
}

/**
 * 1. Gets cached asset
 * 2. Calls next();
 *
 * @name getAsset
 * @route { GET } api/assets/:assetId
 * @param { String } assetId
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getAsset = (req, res, next) => {
  const assetId = req.params.assetId;

  // Returns cached asset
  Asset.findOne({ assetId })
    .then(asset => {
      if (asset) {
        req.status = 200;
        req.json = asset;
        return next();
      } else { throw 'No asset'; }
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Asset GET error', error })));
}

/**
 * 1. Gets pagination based number of events from Hermes
 * 2. Transforms events
 * 3. Calls next();
 *
 * @name getEvents
 * @route { GET } api/assets/:assetId/events/
 * @param { String } page - pagination page to get
 * @param { String } perPage - assets perPage to get
 * @param { String } data - data for Hermes events query
 * @param { String } token - for getting public and private assets/events
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getEvents = (req, res, next) => {
  const { page, perPage, data, token } = req.query;
  const assetId = req.query.assetId || req.params.assetId;
  const hermesURL = req.session.user.company.hermes.url;

  const url = `${hermesURL}/events?`;
  url += `assetId=${assetId}&`;
  url += `page=${page || 0}&`;
  url += `perPage=${perPage || 15}&`;
  if (data) { url += data; }

  get(url, token)
    .then(events => {
      req.status = 200;
      req.json = assetsUtils.parseEvents(events);
      return next();
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Events GET error', error })));
}

/**
 * 1. Gets event from Hermes
 * 2. Calls next();
 *
 * @name getEvent
 * @route { GET } api/assets/:assetId/events/:eventId
 * @param { String } token - for getting public and private assets/events
 * @param { String } eventId
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getEvent = (req, res, next) => {
  const { token } = req.query;
  const eventId = req.params.eventId;
  const hermesURL = req.session.user.company.hermes.url;

  const url = `${hermesURL}/events/${eventId}`;

  get(url, token)
    .then(event => {
      req.status = 200;
      req.json = event;
      return next();
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Event GET error', error })));
}

/**
 * 1. Gets signed asset object
 * 2. Creates an asset in Hermes
 * 3. Calls next();
 *
 * @name createAsset
 * @route { POST } api/assets/
 * @param { String } token - for creating public and private assets/events
 * @param { Object } asset
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.createAsset = (req, res, next) => {
  const { token } = req.query;
  const asset = req.body.asset;
  const hermesURL = req.session.user.company.hermes.url;

  if (asset) {
    // Create an asset
    const url = `${hermesURL}/assets`;
    create(url, asset, token)
      .then(assetCreated => {
        const _asset = new Asset({
          _id: new mongoose.Types.ObjectId(),
          assetId: assetCreated.assetId,
          createdBy: assetCreated.content.idData.createdBy,
          updatedAt: assetCreated.content.idData.timestamp,
          createdAt: assetCreated.content.idData.timestamp
        });

        _asset.save()
          .then(inserted => {
            req.status = 200;
            req.json = { assets: { docs: [inserted] } };
            return next();
          }).catch(error => (console.log('Cached asset creation error: ', error), next()));
      });
  } else if (!asset) {
    return res.status(400).json({ message: '"asset" object is required' })
  }
}

/**
 * 1. Gets array of signed event objects
 * 2. Loops and creates each event in Hermes
 * 3. Calls next();
 *
 * @name createEvent
 * @route { POST } api/assets/:assetId/events/
 * @param { String } token - for creating public and private assets/events
 * @param { Object[] } events
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.createEvent = (req, res, next) => {
  const { token } = req.query;
  const events = req.body.events;
  const hermesURL = req.session.user.company.hermes.url;

  if (Array.isArray(events) && events.length > 0) {

    const createEvents = new Promise((resolve, reject) => {
      events.forEach((event, index, array) => {
        const url = `${hermesURL}/assets/${event.content.idData.assetId}/events`;
        create(url, event, token)
          .then(eventCreated => {
            if (index === array.length - 1) { resolve(); }
          }).catch(error => {
            console.log('Event create error: ', error);
            if (index === array.length - 1) { resolve(); }
          });
      });
    });

    createEvents.then(() => (req.status = 200, next()));
  } else { return next(); }
}
