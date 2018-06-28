const express = require('express');

// Controllers
const AuthController = require('../controllers/auth');

// API routes
const apiRoutes = express.Router();

const authRoutes = express.Router();

/********************************
          auth endpoints
********************************/

// append auth routes to api routes
apiRoutes.use('/auth', authRoutes);

// Auth routes
authRoutes.post('/signup', AuthController.signup);
authRoutes.post('/login', AuthController.login);

module.exports = apiRoutes;
