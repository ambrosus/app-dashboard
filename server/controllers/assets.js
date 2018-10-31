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

exports.getAsset = async (req, res, next) => {
  const { token } = req.query;
  const { assetId } = req.params;
  let err, url, body, asset, infoEvent;

  // Get asset
  url = `${api.extended}/asset/query`;
  body = {
    query: [{
      field: 'assetId',
      value: `${assetId}`,
      operator: 'equal'
    }]
  };
  [err, asset] = await to(httpPost(url, body, token));
  if (err || !(asset && asset.results && Array.isArray(asset.results))) {
    logger.error('[GET] Asset: ', err);
    return next(new ValidationError('Error getting asset', err));
  }

  // Get latest info event
  url = `${api.extended}/event/latest/type`;
  body = {
    assets: [assetId],
    type: 'ambrosus.asset.info',
  };
  [err, infoEvent] = await to(httpPost(url, body, token));
  if (err || !(infoEvent && infoEvent.results && Array.isArray(infoEvent.results))) {
    logger.error('[GET] Latest info event: ', err);
    return next(new ValidationError('Error getting asset', err));
  }

  // Connects asset with info event
  asset.results[0]['infoEvent'] = {};
  if (infoEvent.results.length) { asset.results[0].infoEvent = findEvent('info', infoEvent.results); }

  req.status = 200;
  req.json = { data: asset, message: 'Success', status: 200 };
  next();
}

exports.getEvents = async (req, res, next) => {
  const { assetId, token, limit = 15, next: _next, previous } = req.query;
  let err, url, body, events;

  // Get asset
  url = `${api.extended}/event/query`;
  body = {
    query: [{
      field: 'content.idData.assetId',
      value: `${assetId}`,
      operator: 'equal'
    }],
    limit
  };
  if (_next) { body['next'] = _next; }
  if (previous) { body['previous'] = previous; }

  [err, events] = await to(httpPost(url, body, token));
  if (err || !(events && events.results && Array.isArray(events.results))) {
    logger.error('[GET] Events: ', err);
    return next(new ValidationError('Error getting events', err));
  }

  req.status = 200;
  req.json = { data: events, message: 'Success', status: 200 };
  next();
}

exports.getEvent = async (req, res, next) => {
  const { token } = req.query;
  const eventId = req.params.eventId;
  let err, url, body, event;

  // Get event
  url = `${api.extended}/event/query`;
  body = {
    query: [{
      field: 'eventId',
      value: `${eventId}`,
      operator: 'equal'
    }]
  };
  [err, event] = await to(httpPost(url, body, token));
  if (err || !(event && event.results && Array.isArray(event.results))) {
    logger.error('[GET] Event: ', err);
    return next(new ValidationError('Error getting event', err));
  }

  req.status = 200;
  req.json = { data: event.results[0], message: 'Success', status: 200 };
  return next();
}

exports.createAsset = async (req, res, next) => {
  const { assets } = req.body;
  let err, url, assetCreated;

  req.json = {
    assets: {
      created: [],
      failed: [],
    },
    events: {
      created: [],
      failed: [],
    },
  };

  if (Array.isArray(assets) && assets.length) {
    // Create asset
    url = `${api.core}/assets`;
    assets.map(async (asset, index, array) => {
      [err, assetCreated] = await to(httpPost(url, asset));
      if (err) {
        logger.error('[CREATE] Asset: ', err);
        req.json.assets.failed.push({ asset, error: err });
      }
      req.json.assets.created.push(assetCreated);

      if (index === array.length - 1) { req.status = 200; return next(); }
    });
  } else { next(new ValidationError('"assets" needs to be a non-empty array of signed asset objects')); }
}

exports.createEvents = async (req, res, next) => {
  const { events } = req.body;
  let err, eventCreated;

  if (!(req.json && req.json.events)) {
    req.json = {
      events: {
        created: [],
        failed: [],
      },
    };
  }

  if (Array.isArray(events) && events.length) {
    // Create events
    events.map(async (event, index, array) => {
      const url = `${api.core}/assets/${event.content.idData.assetId}/events`;
      [err, eventCreated] = await to(httpPost(url, event));
      if (err) {
        logger.error('[CREATE] Event: ', err);
        req.json.events.failed.push({ event, error: err });
      }
      req.json.events.created.push(eventCreated);

      if (index === array.length - 1) { req.status = 200; return next(); }
    });
  } else { next(); }
}
