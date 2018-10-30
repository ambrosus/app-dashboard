/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const { findEvent } = _require('/utils/assets');
const { httpGet, httpPost } = _require('/utils/requests');
const { to } = _require('/utils/general');
const { ValidationError, NotFoundError } = _require('/errors');
const { api } = _require('/config');

exports.getAssets = async (req, res, next) => {
  const { token, limit = 15, next: _next, previous, address } = req.query;
  let err, url, body, assets, assetIds, infoEvents;

  // Get assets
  url = `${api.extended}/asset/query`;
  body = {
    query: [{
      field: 'content.idData.createdBy',
      value: `${address}`,
      operator: 'equal'
    }],
    limit
  };
  if (_next) { body['next'] = _next; }
  if (previous) { body['previous'] = previous; }

  [err, assets] = await to(httpPost(url, body, token));
  if (err || !(assets && assets.results && Array.isArray(assets.results))) {
    logger.error('[GET] Assets: ', err);
    return next(new ValidationError('Error getting assets', err));
  }

  // Extract assetIds
  assetIds = assets.results.reduce((_assetIds, asset, index, array) => {
    if (asset.assetId) { _assetIds.push(asset.assetId); }
    return _assetIds;
  }, []);

  // Get latest info events
  url = `${api.extended}/event/latest/type`;
  body = {
    assets: assetIds,
    type: 'ambrosus.asset.info',
  };
  [err, infoEvents] = await to(httpPost(url, body, token));
  if (err || !(infoEvents && infoEvents.results && Array.isArray(infoEvents.results))) {
    logger.error('[GET] Latest info events: ', err);
    return next(new ValidationError('Error getting assets', err));
  }

  // Connects assets with info event
  assets.results = assets.results.map(asset => {
    asset.infoEvent = infoEvents.results.find(event => asset.assetId === event.content.idData.assetId);
    if (asset.infoEvent) { asset.infoEvent = findEvent('info', [asset.infoEvent]); }
    return asset;
  });

  req.status = 200;
  req.json = { data: assets, message: 'Success', status: 200 };
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
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getAsset = async (req, res, next) => {
  const { token } = req.query;
  const assetId = req.params.assetId;
  let err, asset, infoEvents, assetUpdated;

  // Get cached asset
  [err, asset] = await to(Asset.findOne({ assetId }));
  if (err || !asset) { logger.error('Asset GET error: ', err); return next(new NotFoundError(err.message, err)); }

  // Get info event
  url = `${api.core}/events?assetId=${asset.assetId}&perPage=1&data[type]=ambrosus.asset.info`;

  [err, infoEvents] = await to(httpGet(url, token));
  if (err || !infoEvents) { logger.error('Asset info event GET error: ', err); }

  // Update cached asset
  const infoEvent = findEvent('info', infoEvents.results);
  if (infoEvent) asset['infoEvent'] = JSON.stringify(infoEvent);

  [err, assetUpdated] = await to(Asset.findByIdAndUpdate(asset._id, asset, { new: true }));
  if (err || !assetUpdated) {
    logger.error('Asset update error: ', err);
    req.json = asset;
  }

  req.status = 200;
  req.json = { data: assetUpdated, message: 'Success', status: 200 };
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
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getEvents = async (req, res, next) => {
  const { createdBy, data, assetId, page, perPage, assets, token } = req.query;
  const address = req.query.address;
  let err, events, cachedAssets, cachedAsset, updateCachedAsset;

  let url = `${api.core}/events?page=${page || 0}&perPage=${perPage || 15}&`;
  try {
    if (createdBy) { url += `${decodeURI(createdBy)}&`; } else { url += `createdBy=${address}&`; }
    if (data) { url += `${decodeURI(data)}&`; }
    if (assetId) { url += `${decodeURI(assetId)}&`; }
  } catch (e) {}

  [err, events] = await to(httpGet(url, token));
  if (err || !events) { return next(new NotFoundError(err.data['reason'])); }

  const eventsCopy = JSON.parse(JSON.stringify(events));

  if (assets) {
    // Extract unique assetIds
    const assetIds = eventsCopy.results.reduce((_assetIds, event) => {
      let _assetId = '';
      try { _assetId = event.content.idData.assetId; } catch (e) {}
      if (_assetIds.indexOf(_assetId) === -1) { _assetIds.push(_assetId); }
      return _assetIds;
    }, []);

    [err, cachedAssets] = await to(Asset.paginate({ assetId: { $in: assetIds } }, { limit: 500, sort: '-createdAt' }));
    if (err || !cachedAssets) { logger.error('Assets GET error: ', err); return next(new ValidationError(err.message, err)); }

    req.status = 200;
    req.json = { data: cachedAssets, message: 'Success', status: 200 };
    return next();
  } else {
    // Update cached asset
    [err, cachedAsset] = await to(Asset.findOne({ assetId: assetId.substring(assetId.indexOf('=') + 1) }));
    if (err || !cachedAsset) { logger.error('Asset GET error: ', err); return next(new ValidationError(err.message, err)); }

    const latestEvent = findEvent('latest', eventsCopy.results);
    let cachedAssetsLatestEvent = '';
    try { cachedAssetsLatestEvent = JSON.parse(cachedAsset.latestEvent); } catch (e) {}

    if (latestEvent && (!cachedAssetsLatestEvent || cachedAssetsLatestEvent.timestamp < latestEvent.timestamp)) {
      cachedAsset.latestEvent = JSON.stringify(latestEvent);

      [err, updateCachedAsset] = await to(Asset.findByIdAndUpdate(cachedAsset._id, cachedAsset, { new: true }));
      if (err || !updateCachedAsset) { logger.error('Asset update error: ', err); }
    }

    req.status = 200;
    req.json = { data: events, message: 'Success', status: 200 };
    return next();
  }
}

/**
 * 1. Gets event from Hermes
 * 2. Calls next();
 *
 * @name getEvent
 * @route { GET } api/assets/:assetId/events/:eventId
 * @param { String } token - for getting public and private assets/events
 * @param { String } eventId
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getEvent = async (req, res, next) => {
  const { token } = req.query;
  const eventId = req.params.eventId;
  let err, event;

  const url = `${api.core}/events/${eventId}`;

  [err, event] = await to(httpGet(url, token));
  if (err || !event) { logger.error('Event GET error: ', err); return next(new NotFoundError(err.data['reason'])); }

  req.status = 200;
  req.json = { data: event, message: 'Success', status: 200 };
  return next();
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
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.createAsset = async (req, res, next) => {
  const assets = req.body.assets;
  req.json = { data: { assets: { docs: [] } } };
  let err, assetCreated, assetInserted;

  if (Array.isArray(assets) && assets.length > 0) {
    // Create asset
    const url = `${api.core}/assets`;
    assets.map(async (asset, index, array) => {
      [err, assetCreated] = await to(httpPost(url, asset));
      if (err || !assetCreated) { logger.error('Asset create error: ', err); }
      if (assetCreated) {
        [err, assetInserted] = await to(
          Asset.create({
            _id: new mongoose.Types.ObjectId(),
            assetId: assetCreated.assetId,
            createdBy: assetCreated.content.idData.createdBy,
            updatedAt: assetCreated.content.idData.timestamp * 1000,
            createdAt: assetCreated.content.idData.timestamp * 1000
          })
        );
        if (err || !assetInserted) { logger.error('Cached asset creation error: ', err); }
        if (assetInserted) { req.json.data.assets.docs.push(assetInserted); }
      }
      if (index === array.length - 1) { req.status = 200; return next(); }
    });

  } else { next(new ValidationError('"assets" needs to be a non-empty array of signed asset objects')) }
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
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.createEvents = async (req, res, next) => {
  const events = req.body.events;
  if (req.json && req.json.data) { req.json.data['events'] = [] } else { req.json = { data: { events: [] } } }
  let err, eventCreated, assetUpdated;

  if (Array.isArray(events) && events.length > 0) {
    events.map(async (event, index, array) => {
      const url = `${api.core}/assets/${event.content.idData.assetId}/events`;
      [err, eventCreated] = await to(httpPost(url, event));
      if (err || !eventCreated) { logger.error('Event create error: ', err); }
      if (eventCreated) {
        req.json.data.events.push(eventCreated);

        // Update cached asset
        const latestEvent = findEvent('latest', [eventCreated]);
        const infoEvent = findEvent('info', [eventCreated]);

        const asset = { assetId: eventCreated.content.idData.assetId };
        if (latestEvent) asset['latestEvent'] = JSON.stringify(latestEvent);
        if (infoEvent) asset['infoEvent'] = JSON.stringify(infoEvent);

        [err, assetUpdated] = await to(Asset.findOneAndUpdate({ assetId: asset.assetId }, asset, { new: true }));
        if (err || !assetUpdated) { logger.error('Asset update error: ', err); }
      }
      if (index === array.length - 1) { req.status = 200; return next(); }
    });
  } else { return next() }
}
