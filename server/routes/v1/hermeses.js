const express = require('express');

const HermesesController = require('../../controllers/hermeses');

const HermesesRoutes = express.Router();

// Routes
HermesesRoutes.post('/', HermesesController.create, (req, res) => { res.status(req.status).json(req.json); });
HermesesRoutes.get('/', HermesesController.getAll, (req, res) => { res.status(req.status).json(req.json); });

module.exports = HermesesRoutes;
