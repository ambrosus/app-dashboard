/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const axios = require('axios');
const mongoose = require('mongoose');

const Asset = require('../models/assets');
const assetsUtils = require('../utils/assets');

const get = (url, token) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) { headers['Authorization'] = `AMB_TOKEN ${token}`; }
  return new Promise((resolve, reject) => {
    axios.get(url, { headers, data: null })
      .then(resp => resolve(resp.data))
      .catch(error => reject(error));
  });
}

const create = (url, body, token = null) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  if (token) { headers['Authorization'] = `AMB_TOKEN ${token}`; }
  return new Promise((resolve, reject) => {
    axios.post(url, body, { headers, data: null })
      .then(resp => resolve(resp.data))
      .catch(error => reject(error));
  });
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

  Asset.paginate({ createdBy: user.address }, { page: 1, limit: 1 })
    .then(as => {
      let url = `${user.hermes.url}/assets?createdBy=${user.address}&perPage=500&`;
      if (as.docs.length > 0) { url += `fromTimestamp=${new Date(as.docs[0].updatedAt).getTime()}`; }

      // GET assets from Hermes
      get(url, token)
        .then(_assets => {
          // Insert assets to db
          const insertAssets = new Promise((resolve, reject) => {
            if (_assets.results.length === 0) { resolve(); }
            _assets.results.forEach((asset, index, array) => {
              const _asset = new Asset({
                _id: new mongoose.Types.ObjectId(),
                assetId: asset.assetId,
                createdBy: asset.content.idData.createdBy,
                updatedAt: new Date(),
                createdAt: asset.content.idData.timestamp * 1000
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
            Asset.paginate({ createdBy: user.address }, { page: parseInt(page) || 1, limit: parseInt(perPage) || 15, sort: '-createdAt' })
              .then(assets => {
                req.status = 200;
                req.json = { assets };
                return next();
              }).catch(error => (console.log(error), res.status(400).json({ message: 'Cached Assets GET error', error })));
          });
        }).catch(error => (console.log(error), res.status(400).json({ message: 'Assets GET error', error })));
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Cached Asset GET error', error })));
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
 * Used for searching assets and events
 * 1. Gets pagination based number of events from Hermes
 * 2. If searching assets (assets=true), extracts unique assetIds
 *    and returns cached assets.
 * 3. If searching events, transforms events for timeline
 * 4. Calls next();
 *
 * @name getEvents
 * @route { GET } api/assets/:assetId/events/
 * @param { String } createdBy
 * @param { String } assetId
 * @param { String } assets - boolean, pass to search assets
 * @param { String } page - pagination page to get
 * @param { String } perPage - assets perPage to get
 * @param { String } data - data for Hermes events query
 * @param { String } identifier - identifier for Hermes events query
 * @param { String } token - for getting public and private assets/events
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getEvents = (req, res, next) => {
  const { createdBy, data, assetId, page, perPage, assets, token, assetPage, assetPerPage } = req.query;
  const user = req.session.user;

  let url = `${user.hermes.url}/events?`;
  url += `page=${page || 0}&`;
  url += `perPage=${perPage || 15}&`;
  if (createdBy) { url += `${decodeURI(createdBy)}&`; } else { url += `createdBy=${user.address}&`; }
  if (data) { url += `${decodeURI(data)}&`; }
  if (assetId) { url += `${decodeURI(assetId)}&`; }

  get(url, token)
    .then(events => {
      if (assets) {
        // Extract unique assetIds
        const assetIds = events.results.reduce((_assetIds, event) => {
          let _assetId = '';
          try { _assetId = event.content.idData.assetId; } catch (e) {}
          if (_assetIds.indexOf(_assetId) === -1) { _assetIds.push(_assetId); }
          return _assetIds;
        }, []);

        // Find cached assets
        Asset.paginate({ assetId: { $in: assetIds } }, { page: parseInt(assetPage) || 1, limit: parseInt(assetPerPage) || 15, sort: '-createdAt' })
          .then(_assets => {
            req.status = 200;
            req.json = { assets: _assets };
            return next();
          }).catch(error => (console.log(error), res.status(400).json({ message: 'Cached Assets GET error', error })));
      } else {
        // Timeline array of events
        req.status = 200;
        req.json = events;
        return next();
      }
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
  const user = req.session.user;

  const url = `${user.hermes.url}/events/${eventId}`;

  get(url, token)
    .then(event => {
      req.status = 200;
      req.json = event;
      return next();
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Event GET error', error })));
}

/**
 * 1. Gets array of signed asset objects
 * 2. Creates each asset in Hermes
 * 3. Creates cached assets in dash db
 * 4. Calls next();
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
  const assets = req.body.assets;
  const user = req.session.user;
  req.json = { assets: { docs: [] } };

  if (Array.isArray(assets) && assets.length > 0) {
    // Create an asset
    const url = `${user.hermes.url}/assets`;
    const createAssets = new Promise((resolve, reject) => {
      assets.forEach((asset, index, array) => {
        create(url, asset)
          .then(assetCreated => {
            const _asset = new Asset({
              _id: new mongoose.Types.ObjectId(),
              assetId: assetCreated.assetId,
              createdBy: assetCreated.content.idData.createdBy,
              updatedAt: assetCreated.content.idData.timestamp * 1000,
              createdAt: assetCreated.content.idData.timestamp * 1000
            });

            _asset.save()
              .then(inserted => {
                req.json.assets.docs.push(inserted);
                if (index === array.length - 1) { resolve(); }
              }).catch(error => {
                console.log('Cached asset creation error: ', error);
                if (index === array.length - 1) { resolve(); }
              });
          });
      });
    });

    createAssets.then(() => (req.status = 200, next()));
  } else if (!(Array.isArray(assets) && assets.length > 0)) {
    return res.status(400).json({ message: '"assets" needs to be a non-empty array of signed asset objects' })
  }
}

/**
 * 1. Gets array of signed event objects
 * 2. Creates each event in Hermes
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
  const events = req.body.events;
  const user = req.session.user;
  if (req.json) {
    req.json['events'] = [];
  } else { req.json = { events: [] } }

  if (Array.isArray(events) && events.length > 0) {

    const createEvents = new Promise((resolve, reject) => {
      events.forEach((event, index, array) => {
        const url = `${user.hermes.url}/assets/${event.content.idData.assetId}/events`;
        create(url, event)
          .then(eventCreated => {
            req.json.events.push(eventCreated);
            const latestEvent = assetsUtils.findEvent('latest', [eventCreated]);
            const infoEvent = assetsUtils.findEvent('info', [eventCreated]);

            const asset = { assetId: eventCreated.content.idData.assetId };
            if (latestEvent) { asset['latestEvent'] = JSON.stringify(latestEvent); }
            if (infoEvent) { asset['infoEvent'] = JSON.stringify(infoEvent); }

            // Update the asset
            Asset.findOneAndUpdate({ assetId: asset.assetId }, asset)
              .then(assetUpdated => { if (index === array.length - 1) { resolve(); } })
              .catch(error => {
                console.log('Asset update error: ', error);
                if (index === array.length - 1) { resolve(); }
              });
          }).catch(error => {
            console.log('Event create error: ', error);
            if (index === array.length - 1) { resolve(); }
          });
      });
    });

    createEvents.then(() => (req.status = 200, next()));
  } else { return next(); }
}
