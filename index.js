'use strict';

require('dotenv').config();

// Start up DB Server
const mongoose = require('mongoose');
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
mongoose.connect(process.env.MONGODB_URI, options);

// Start the web server
require('./src/server.js').start(process.env.PORT);