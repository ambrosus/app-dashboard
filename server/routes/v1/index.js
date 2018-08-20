const express = require('express');

const HermesesRoutes = require('./hermeses');
const CompaniesRoutes = require('./companies');
const AuthRoutes = require('./auth');
const UsersRoutes = require('./users');

const APIRoutes = express.Router();

APIRoutes.use('/hermeses', HermesesRoutes);
APIRoutes.use('/companies', CompaniesRoutes);
APIRoutes.use('/auth', AuthRoutes);
APIRoutes.use('/users', UsersRoutes);

module.exports = APIRoutes;
