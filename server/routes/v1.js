const express = require('express');

// Controllers
const HermesController = require('../controllers/hermes');
const CompanyController = require('../controllers/company');
const PersonController = require('../controllers/person');
const EmailController = require('../controllers/email');
const NotificationController = require('../controllers/notification');

// API routes
const apiRoutes = express.Router();

const HermesRoutes = express.Router();
const CompanyRoutes = express.Router();
const PersonRoutes = express.Router();
const EmailRoutes = express.Router();
const NotificationRoutes = express.Router();

/********************************

        hermes endpoints

********************************/

apiRoutes.use('/hermes', HermesRoutes);

HermesRoutes.post('/', HermesController.register);
HermesRoutes.get('/', HermesController.getAll);

/********************************

        company endpoints

********************************/

apiRoutes.use('/company', CompanyRoutes);

CompanyRoutes.post('/', CompanyController.create);

/********************************

        person endpoints

********************************/

apiRoutes.use('/person', PersonRoutes);

PersonRoutes.post('/login', PersonController.login);
PersonRoutes.post('/resetpassword', PersonController.resetpassword);
PersonRoutes.get('/accounts/:address', PersonController.account);

/********************************

        email endpoints

********************************/

apiRoutes.use('/email', EmailRoutes);

EmailRoutes.post('/', EmailController.sendEmail);

/********************************

      notification endpoints

********************************/

// apiRoutes.use('/notification', NotificationRoutes);

// NotificationRoutes.post('/:address', NotificationController.create);
// NotificationRoutes.get('/:address', NotificationController.get);
// NotificationRoutes.put('/:address/seen', NotificationController.seen);


module.exports = apiRoutes;
