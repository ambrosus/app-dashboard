const express = require('express');

// Controllers
const AuthController = require('../controllers/auth');
const NotificationController = require('../controllers/notifications');
const EmailController = require('../controllers/email');

// API routes
const apiRoutes = express.Router();

const authRoutes = express.Router();
const notificationsRoutes = express.Router();
const emailRoutes = express.Router();

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
authRoutes.put('/accounts/:address', AuthController.edit);
authRoutes.delete('/accounts', AuthController.clean);

/********************************

     notifications endpoints

********************************/

// append auth routes to api routes
apiRoutes.use('/notifications', notificationsRoutes);

// Auth routes
notificationsRoutes.post('/:address', NotificationController.create);
notificationsRoutes.get('/:address', NotificationController.get);
notificationsRoutes.put('/:address/viewed', NotificationController.viewed);
notificationsRoutes.delete('/', NotificationController.clean);

/********************************

        email endpoints

********************************/

// append auth routes to api routes
apiRoutes.use('/email', emailRoutes);

// Auth routes
emailRoutes.post('/', EmailController.sendEmail);


module.exports = apiRoutes;
