/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');

const Asset = _require('/models/assets');
const { findEvent } = _require('/utils/assets');
const { httpGet, httpPost } = _require('/utils/requests');
const { to } = _require('/utils/general');
const { ValidationError, NotFoundError } = _require('/errors');

/**
 * 1. Gets paginated assets from dash db
 * 2. Calls next();
 *
 * @name getAssets
 * @route { GET } api/assets/
 * @param { String } page - pagination page to get
 * @param { String } perPage - assets perPage to get
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getAssets = async (req, res, next) => {
  const { page, perPage } = req.query;
  const user = req.session.user;
  let err, assets;

  [err, assets] = await to(Asset.paginate({ createdBy: user.address }, { page: parseInt(page) || 1, limit: parseInt(perPage) || 15, sort: '-createdAt' }));
  if (err) { logger.error('Assets GET error: ', err.message); return next(new ValidationError(err.message)); };

  req.status = 200;
  req.json = { assets };
  next();
}

/**
 * 1. Gets cached asset
 * 2. Gets latest info and updates cached asset
 * 3. Calls next();
 *
 * @name getAsset
 * @route { GET } api/assets/:assetId
 * @param { String } assetId
 * @param { String } token - for getting public and private assets/events
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getAsset = async (req, res, next) => {
  const { token } = req.query;
  const assetId = req.params.assetId;
  const user = req.session.user;
  let err, asset, infoEvents, assetUpdate;

  // Get cached asset
  [err, asset] = await to(Asset.findOne({ assetId }));
  if (err) return next(new NotFoundError(err.message));

  // Get info event
  url = `${user.hermes.url}/events?assetId=${asset.assetId}&perPage=1&data[type]=ambrosus.asset.info`;

  [err, infoEvents] = await to(httpGet(url, token));
  if (err) logger.error('Asset info event GET error: ', err.data['reason']);

  // Update cached asset
  const infoEvent = findEvent('info', infoEvents.results);
  if (infoEvent) { asset['infoEvent'] = JSON.stringify(infoEvent); }

  [err, assetUpdate] = await to(Asset.findByIdAndUpdate(asset._id, asset));
  if (err) { logger.error('Asset update error: ', err.message), req.json = asset; };

  req.status = 200;
  req.json = assetUpdate;
  next();
}

/**
 * Used for searching assets and events
 * 1. Gets pagination based number of events from Hermes
 * 2. If searching assets (assets=true), extracts unique assetIds
 *    and returns cached assets.
 * 3. If searching events, gets events, updates asset's latestEvent
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
  const { createdBy, data, assetId, page, perPage, assets, token } = req.query;
  const user = req.session.user;

  let url = `${user.hermes.url}/events?`;
  url += `page=${page || 0}&`;
  url += `perPage=${perPage || 15}&`;
  if (createdBy) { url += `${decodeURI(createdBy)}&`; } else { url += `createdBy=${user.address}&`; }
  if (data) { url += `${decodeURI(data)}&`; }
  if (assetId) { url += `${decodeURI(assetId)}&`; }

  httpGet(url, token)
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
        Asset.paginate({ assetId: { $in: assetIds } }, { limit: 500, sort: '-createdAt' })
          .then(_assets => {
            req.status = 200;
            req.json = { assets: _assets, events };
            return next();
          }).catch(error => (logger.error(error), res.status(400).json({ message: 'Cached Assets GET error', error })));
      } else {
        // Timeline array of events
        Asset.findOne({ assetId: assetId.substring(assetId.indexOf('=') + 1) })
          .then(asset => {
            if (asset) {
              const latestEvent = findEvent('latest', events.results);

              let assetsLatestEvent = '';
              try { assetsLatestEvent = JSON.parse(asset.latestEvent); } catch (e) {}

              if (latestEvent && (!assetsLatestEvent || assetsLatestEvent.timestamp < latestEvent.timestamp)) {
                asset.latestEvent = JSON.stringify(latestEvent);
                Asset.findByIdAndUpdate(asset._id, asset)
                  .then(updated => logger.info('Asset updated: ', updated))
                  .catch(error => logger.error('Asset update error: ', error));
              }
            } else { throw 'No asset'; }
          }).catch(error => (logger.error(error), res.status(400).json({ message: 'Asset GET error', error })));

        req.status = 200;
        req.json = { events };
        return next();
      }
    }).catch(error => (logger.error(error), res.status(400).json({ message: 'Events GET error', error })));
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

  httpGet(url, token)
    .then(event => {
      req.status = 200;
      req.json = event;
      return next();
    }).catch(error => (logger.error(error), res.status(400).json({ message: 'Event GET error', error })));
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
 * @param { Object[] } assets
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
        httpPost(url, asset)
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
                logger.error('Cached asset creation error: ', error);
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
 * 3. Updates cached assets
 * 4. Calls next();
 *
 * @name createEvent
 * @route { POST } api/assets/:assetId/events/
 * @param { String } token - for creating public and private assets/events
 * @param { Object[] } events
 * @param { Object } session - logged in user session
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.createEvents = (req, res, next) => {
  const events = req.body.events;
  const user = req.session.user;
  if (req.json) { req.json['events'] = []; } else { req.json = { events: [] } }

  if (Array.isArray(events) && events.length > 0) {

    const createEvents = new Promise((resolve, reject) => {
      events.forEach((event, index, array) => {
        const url = `${user.hermes.url}/assets/${event.content.idData.assetId}/events`;
        httpPost(url, event)
          .then(eventCreated => {
            req.json.events.push(eventCreated);
            const latestEvent = findEvent('latest', [eventCreated]);
            const infoEvent = findEvent('info', [eventCreated]);

            const asset = { assetId: eventCreated.content.idData.assetId };
            if (latestEvent) { asset['latestEvent'] = JSON.stringify(latestEvent); }
            if (infoEvent) { asset['infoEvent'] = JSON.stringify(infoEvent); }

            // Update the asset
            Asset.findOneAndUpdate({ assetId: asset.assetId }, asset)
              .then(assetUpdated => { if (index === array.length - 1) { resolve(); } })
              .catch(error => {
                logger.error('Asset update error: ', error);
                if (index === array.length - 1) { resolve(); }
              });
          }).catch(error => {
            logger.error('Event create error: ', error);
            if (index === array.length - 1) { resolve(); }
          });
      });
    });

    createEvents.then(() => (req.status = 200, next()));
  } else { return next(); }
}
