const express = require('express');

// Controllers
const AuthController = require('../controllers/auth');
const NotificationController = require('../controllers/notifications');

// API routes
const apiRoutes = express.Router();

const authRoutes = express.Router();
const notificationsRoutes = express.Router();

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
authRoutes.delete('/accounts', AuthController.clean);

/********************************
    notifications endpoints
********************************/

// append auth routes to api routes
apiRoutes.use('/notifications', notificationsRoutes);

// Auth routes
notificationsRoutes.post('/', NotificationController.create);
notificationsRoutes.get('/:address', NotificationController.get);
notificationsRoutes.put('/viewed', NotificationController.viewed);


module.exports = apiRoutes;
