global.base_dir = __dirname;
global.abs_path = path => base_dir + path;
global._require = file => require(abs_path('/server' + file));
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const config = require('./server/config');
const mongoose = require('mongoose');
const invitationsCron = require('./server/cron/invitation-cron');
// use log, trace, debug, info, warn, error when logging with *logger*
global.logger = require('tracer').colorConsole();

const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./server/middleware/errorHandler');

const APIRoutes = require('./server/routes/v1');
const Sentry = require('@sentry/node');

if (config.production) {
  Sentry.init({
    dsn: 'https://3bed4d5c72424dac81458cac8a594789@sentry.io/1319719',
  });
}

/**
 * Express instance
 * @public
 */
const app = express();

// Debug
if (config.production) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorHandler);

app.use(helmet());

// gzip compression
app.use(compress());

// Enable HTTP CRUD methods (e.g. PUT, DELETE)
app.use(methodOverride());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// Mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect(
    config.db,
    { useNewUrlParser: true },
  )
  .then(connected => {
    logger.info('MongoDB connected');
    // invitationsCron.start();
  })
  .catch(error => logger.error('Mongodb connection error: ', error));

app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/api', APIRoutes);
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'dist/index.html')),
);

const server = http.createServer(app);
server.listen(config.port, () => logger.info('Server running...'));

module.exports = app;
