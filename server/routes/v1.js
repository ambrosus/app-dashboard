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
authRoutes.post('/resetpassword', AuthController.resetpassword);
authRoutes.get('/accounts', AuthController.accounts);
authRoutes.get('/accounts/:address', AuthController.account);
authRoutes.post('/accounts/:address', AuthController.account);
authRoutes.delete('/accounts', AuthController.clean);


module.exports = apiRoutes;
