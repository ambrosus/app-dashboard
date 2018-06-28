const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser');

const apiRoutes = require('./api/routes/v1');

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/api', apiRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.set('port', PORT);

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log('Server running.');
});
