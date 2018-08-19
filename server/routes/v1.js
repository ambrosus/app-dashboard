const express = require('express');

// Controllers
const HermesesController = require('../controllers/hermeses');
const CompaniesController = require('../controllers/companies');
const UsersController = require('../controllers/users');
const InvitesController = require('../controllers/invites');
const NotificationController = require('../controllers/notifications');

// API routes
const apiRoutes = express.Router();

const HermesesRoutes = express.Router();
const CompaniesRoutes = express.Router();
const UsersRoutes = express.Router();
const InvitesRoutes = express.Router();
const NotificationsRoutes = express.Router();

/********************************

        hermeses endpoints

********************************/

apiRoutes.use('/hermeses', HermesesRoutes);

HermesesRoutes.post('/', HermesesController.create);
HermesesRoutes.get('/', HermesesController.getAll);

/********************************

        companies endpoints

********************************/

apiRoutes.use('/companies', CompaniesRoutes);

CompaniesRoutes.post('/', CompaniesController.create);

/********************************

        users endpoints

********************************/

apiRoutes.use('/users', UsersRoutes);

UsersRoutes.post('/login', UsersController.login);
UsersRoutes.post('/changepassword', UsersController.changePassword);
UsersRoutes.get('/accounts/:address', UsersController.getAccount);

/********************************

        invites endpoints

********************************/

apiRoutes.use('/invites', InvitesRoutes);

InvitesRoutes.post('/', InvitesController.send);

/********************************

      notification endpoints

********************************/

// apiRoutes.use('/notification', NotificationsRoutes);

// NotificationsRoutes.post('/:address', NotificationController.create);
// NotificationsRoutes.get('/:address', NotificationController.get);
// NotificationsRoutes.put('/:address/seen', NotificationController.seen);


module.exports = apiRoutes;
