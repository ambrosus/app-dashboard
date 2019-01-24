/*
 * KEEP THE FILE FOR HEROKU INSTANCES !!!!!
 */

const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.set('port', PORT);

const server = http.createServer(app);
server.listen(PORT, () => { console.log('Server running.'); });