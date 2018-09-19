/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const express = require('express');

const AssetsController = require('../../controllers/assets');

const AssetsRoutes = express.Router();

// Routes
AssetsRoutes.route('/')
  .post(AssetsController.createAsset, AssetsController.createEvent, AssetsController.updateCachedAssets, (req, res) => { res.status(req.status).json(req.json); })
  .get(AssetsController.getAssets, AssetsController.updateCachedAssets, (req, res) => { res.status(req.status).json(req.json); });

AssetsRoutes.get('/:assetId', AssetsController.getAsset, (req, res) => { res.status(req.status).json(req.json); });

AssetsRoutes.route('/:assetId/events')
  .get(AssetsController.getEvents, (req, res) => { res.status(req.status).json(req.json); })
  .post(AssetsController.createEvent, (req, res) => { res.status(req.status).json(req.json); });

AssetsRoutes.get('/:assetId/events/:eventId', AssetsController.getEvent, (req, res) => { res.status(req.status).json(req.json); });

module.exports = AssetsRoutes;
