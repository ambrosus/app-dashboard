const express = require('express');

const AuthController = require('../../controllers/auth');

const AuthRoutes = express.Router();

// Routes
AuthRoutes.post('/login', AuthController.login, (req, res) => { res.status(req.status).json(req.json); });
AuthRoutes.put('/password', AuthController.changePassword, (req, res) => { res.status(req.status).json(req.json); });

module.exports = AuthRoutes;
