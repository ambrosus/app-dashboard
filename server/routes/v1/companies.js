const express = require('express');

const CompaniesController = require('../../controllers/companies');

const CompaniesRoutes = express.Router();

// Routes
CompaniesRoutes.post('/', CompaniesController.create, (req, res) => { res.status(req.status).json(req.json); });

module.exports = CompaniesRoutes;
