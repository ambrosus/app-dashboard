/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Web3 = require('web3');
const web3 = new Web3();
const findOrCreate = require('mongoose-findorcreate');

const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const users = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  full_name: {
    type: String,
    required: [(value) => !value, '"Full name" field is required'],
    minLength: 4,
  },
  email: {
    type: String,
    required: [(value) => !value, '"Email" field is required'],
    validate: [validateEmail, 'E-mail format is not valid'],
  },
  password: {
    type: String,
    required: [(value) => !value, '"Password" field is required'],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companies',
  },
  address: {
    type: String,
    required: [(value) => !value, '"Address" field is required'],
    validate: [web3.utils.isAddress, 'Address format is not valid'],
  },
  token: {
    type: String,
    required: [(value) => !value, '"Token" field is required'],
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles',
  },
  profile: {
    image: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  settings: String,
  lastLogin: {
    type: Date,
    default: +new Date(),
  },
  createdAt: {
    type: Date,
    default: +new Date(),
  },
  updatedAt: {
    type: Date,
    default: +new Date(),
  }
});

users.plugin(findOrCreate);

users.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

users.pre('save', function(next) {

  if (!this.isModified('password')) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (!err) {
      this.password = hash;
      this.updatedAt = +new Date();
      this.lastLogin = +new Date();
      next();
    } else { next(new Error('Failure in password hashing')); }
  });

});

users.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Users', users);
