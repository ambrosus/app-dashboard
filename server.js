global.base_dir = __dirname;
global.abs_path = path => base_dir + path;
global._require = file => require(abs_path('/server' + file));
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const config = require('./server/config');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const invitationsCron = require('./server/cron/invitation-cron');
// use log, trace, debug, info, warn, error when logging with *logger*
global.logger = require('tracer').colorConsole();

const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const error_handler = require('./server/middleware/error_handler');

const APIRoutes = require('./server/routes/v1');

/**
 * Express instance
 * @public
 */
const app = express();

app.use(helmet());

// gzip compression
app.use(compress());

// Enable HTTP CRUD methods (e.g. PUT, DELETE)
app.use(methodOverride());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect(config.db, { useNewUrlParser: true })
  .then(connected => (logger.info('MongoDB connected'), invitationsCron.start()))
  .catch(error => logger.error('Mongodb connection error: ', error));

// Session store
const store = new MongoDBStore({
  uri: config.db,
  collection: 'sessions',
});

store.on('connected', () => (logger.info('MongoDB Session Store connected'), store.client));
store.on('error', error => logger.error('MongoDB Session Store connection error: ', error));

app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const maxAge = 2 * 24 * 60 * 60 * 1000; // 2 days
const sess = {
  secret: config.secret,
  resave: false,
  saveUninitialized: true,
  store,
  cookie: {
    maxAge,
  },
};

if (config.production) {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));

// Routes
app.use('/api', APIRoutes);
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));

app.use(error_handler);

const server = http.createServer(app);
server.listen(config.port, () => logger.info('Server running...'));

module.exports = app;
