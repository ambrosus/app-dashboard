const HermesesRoutes = require('./v1/hermeses');
const CompaniesRoutes = require('./v1/companies');
const AuthRoutes = require('./v1/auth');
const UsersRoutes = require('./v1/users');

const APIRoutes = express.Router();

APIRoutes.use('/hermeses', HermesesRoutes);
APIRoutes.use('/companies', CompaniesRoutes);
APIRoutes.use('/auth', AuthRoutes);
APIRoutes.use('/users', UsersRoutes);

module.exports = APIRoutes;
