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
const { hermes } = _require('/config');

/**
 * 1. Gets paginated assets from dash db
 * 2. Calls next();
 *
 * @name getAssets
 * @route { GET } api/assets/
 * @param { String } page - pagination page to get
 * @param { String } perPage - assets perPage to get
 * @returns 400 on error
 * @returns 200 and next() on success
 */
exports.getAssets = async (req, res, next) => {
  const { page, perPage } = req.query;
  const address = req.query.address;
  let err, assets;

  [err, assets] = await to(Asset.paginate({ createdBy: address }, { page: parseInt(page) || 1, limit: parseInt(perPage) || 15, sort: '-createdAt' }));
  if (err || !assets) { logger.error('Assets GET error: ', err); return next(new ValidationError(err.message, err)); }

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
  url = `${hermes.url}/events?assetId=${asset.assetId}&perPage=1&data[type]=ambrosus.asset.info`;

  [err, infoEvents] = await to(httpGet(url, token));
  if (err || !infoEvents) { logger.error('Asset info event GET error: ', err); }

  // Update cached asset
  const infoEvent = findEvent('info', infoEvents.results);
  if (infoEvent) asset['infoEvent'] = JSON.stringify(infoEvent);

  [err, assetUpdated] = await to(Asset.findByIdAndUpdate(asset._id, asset));
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

  let url = `${hermes.url}/events?page=${page || 0}&perPage=${perPage || 15}&`;
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

      [err, updateCachedAsset] = await to(Asset.findByIdAndUpdate(cachedAsset._id, cachedAsset));
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

  const url = `${hermes.url}/events/${eventId}`;

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
    const url = `${hermes.url}/assets`;
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
      const url = `${hermes.url}/assets/${event.content.idData.assetId}/events`;
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

        [err, assetUpdated] = await to(Asset.findOneAndUpdate({ assetId: asset.assetId }, asset));
        if (err || !assetUpdated) { logger.error('Asset update error: ', err); }
      }
      if (index === array.length - 1) { req.status = 200; return next(); }
    });
  } else { return next() }
}
