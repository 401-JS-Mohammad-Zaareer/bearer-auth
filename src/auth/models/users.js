'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const SECRET = process.env.SECRET || 'Sabane5';

const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Adds a virtual field to the schema. We can see it, but it never persists
// So, on every user object ... this.token is now readable!
users.virtual('token').get(function () {
  let tokenObject = {
    username: this.username,
  }
  return jwt.sign(tokenObject, process.env.SECRET);
});

users.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// BASIC AUTH
users.statics.authenticateBasic = async function (username, password) {
  const user = await this.findOne({ username })
  const valid = await bcrypt.compare(password, user.password)
  if (valid) { return user; }
  throw new Error('Invalid User');
}

// BEARER AUTH
users.statics.authenticateWithToken = async function (token) {
  try {
    const parsedToken = jwt.verify(token, process.env.SECRET);
    const user = await this.findOne({ username: parsedToken.username })
    if (user) { 
      ///// renewing token for 15 minutes with each request
      
      // user.token = jwt.sign({
      //   exp: Math.floor(Date.now() / 1000) + (60 * 15),
      //   data: parsedToken,
      // }, process.env.SECRET);

      // A better way to renew with expiration limit
      user.token = jwt.sign(
        parsedToken,
        process.env.SECRET,
        {expiresIn: '15m'},
      );

      return user;
    }
    throw new Error('User Not Found');
  } catch (e) {
    throw new Error(e.message)
  }
}


module.exports = mongoose.model('users', users);
