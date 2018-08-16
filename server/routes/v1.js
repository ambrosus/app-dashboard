const express = require('express');

// Controllers
const HermesController = require('../controllers/hermes');
const CompanyController = require('../controllers/company');
const PersonController = require('../controllers/person');
const InviteController = require('../controllers/invite');
const NotificationController = require('../controllers/notification');

// API routes
const apiRoutes = express.Router();

const HermesRoutes = express.Router();
const CompanyRoutes = express.Router();
const PersonRoutes = express.Router();
const InviteRoutes = express.Router();
const NotificationRoutes = express.Router();

/********************************

        hermes endpoints

********************************/

apiRoutes.use('/hermes', HermesRoutes);

HermesRoutes.post('/', HermesController.register);

/********************************

        company endpoints

********************************/

apiRoutes.use('/company', CompanyRoutes);

CompanyRoutes.post('/signup', CompanyController.signup);

/********************************

        person endpoints

********************************/

apiRoutes.use('/person', PersonRoutes);

PersonRoutes.post('/login', PersonController.login);
PersonRoutes.post('/resetpassword', PersonController.resetpassword);
PersonRoutes.get('/accounts', PersonController.accounts);
PersonRoutes.get('/accounts/:address', PersonController.account);
PersonRoutes.put('/accounts/:address', PersonController.edit);

/********************************

        invite endpoints

********************************/

apiRoutes.use('/invite', InviteRoutes);

InviteRoutes.post('/sendemail', InviteController.sendEmail);

/********************************

      notification endpoints

********************************/

apiRoutes.use('/notification', NotificationRoutes);

NotificationRoutes.post('/:address', NotificationController.create);
NotificationRoutes.get('/:address', NotificationController.get);
NotificationRoutes.put('/:address/seen', NotificationController.seen);


module.exports = apiRoutes;
