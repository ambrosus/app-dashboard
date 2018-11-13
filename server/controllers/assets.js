/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { findEvent } = _require('/utils/assets');
const { httpPost } = _require('/utils/requests');
const { to } = _require('/utils/general');
const { ValidationError } = _require('/errors');
const { api } = _require('/config');

exports.createAsset = async (req, res, next) => {
  const { assets } = req.body;
  let err, url, assetCreated;

  req.json = {
    data: {
      assets: {
        created: [],
        failed: [],
      },
      events: {
        created: [],
        failed: [],
      },
    },
  };

  if (Array.isArray(assets) && assets.length) {
    // Create asset
    url = `${api.core}/assets`;
    assets.map(async (asset, index, array) => {
      [err, assetCreated] = await to(httpPost(url, asset));
      if (err) {
        logger.error('[CREATE] Asset: ', err);
        req.json.data.assets.failed.push({ asset, error: err });
      }
      req.json.data.assets.created.push(assetCreated);

      if (index === array.length - 1) {
        req.status = 200;
        return next();
      }
    });
  } else {
    next(
      new ValidationError(
        '"assets" needs to be a non-empty array of signed asset objects',
      ),
    );
  }
};

exports.createEvents = async (req, res, next) => {
  const { events } = req.body;
  let err, url, eventCreated;

  if (!(req.json && req.json.data && req.json.data.events)) {
    req.json = {
      data: {
        events: {
          created: [],
          failed: [],
        },
      },
    };
  }

  if (Array.isArray(events) && events.length) {
    // Create events
    events.map(async (event, index, array) => {
      url = `${api.core}/assets/${event.content.idData.assetId}/events`;
      [err, eventCreated] = await to(httpPost(url, event));
      if (err) {
        logger.error('[CREATE] Event: ', err);
        req.json.data.events.failed.push({ event, error: err });
      }
      req.json.data.events.created.push(eventCreated);

      if (index === array.length - 1) {
        try {
          req.json.data.assets.created = req.json.data.assets.created.map(
            asset => {
              const assetEvents = req.json.data.events.created.filter(
                event => asset.assetId === event.content.idData.assetId,
              );
              asset['infoEvent'] = findEvent('info', assetEvents);
              return asset;
            },
          );

          req.status = 200;
          return next();
        } catch (e) {
          req.status = 200;
          return next();
        }
      }
    });
  } else {
    next();
  }
};
