const express = require('express');

const UsersController = require('../../controllers/users');

const UsersRoutes = express.Router();

// Routes
UsersRoutes.get('/:address', UsersController.getAccount, (req, res) => { res.status(req.status).json(req.json); });

module.exports = UsersRoutes;
