const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Backend EM em execução.',
    projeto: 'backend-base-em',
    banco: process.env.DB_NAME,
    endpoints_principais: ['/api', '/api/health', '/api/leituras']
  });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
