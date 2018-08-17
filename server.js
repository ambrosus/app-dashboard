const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const config = require('./server/config');
const mongoose = require('mongoose');

const apiRoutes = require('./server/routes/v1');

const app = express();

// Mongoose
// mongoose.connect('mongodb://localhost:27017/dash', { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.connect(config.db, { useNewUrlParser: true })
.then(connected => console.log('Mongodb connected'))
.catch(error => console.log('Mongodb connection error: ', error));

app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/api', apiRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const server = http.createServer(app);
server.listen(config.port, () => {
  console.log('Server running...');
});
