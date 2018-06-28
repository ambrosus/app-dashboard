const express = require('express');

// Controllers
const LoginController = require('../controllers/login');
const SignupController = require('../controllers/signup');

// API routes
const apiRoutes = express.Router();

const authRoutes = express.Router();

/********************************
          auth endpoints
********************************/

// append auth routes to api routes
apiRoutes.use('/auth', authRoutes);

// Auth routes
authRoutes.post('/signup', SignupController.signup);
authRoutes.post('/login', LoginController.login);

module.exports = apiRoutes;
