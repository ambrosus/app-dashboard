/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const company = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  title: {
    type: String,
    required: [(value) => !value, 'Title field is required'],
    index: { unique: true },
    minLength: 4,
  },
  hermes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hermeses',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    index: { unique: true },
  },
  active: {
    type: Boolean,
    default: true,
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: { 'preview_app': 'https://amb.to' },
  },
  createdAt: {
    type: Date,
    default: +new Date(),
  },
  updatedAt: {
    type: Date,
    default: +new Date(),
  },
});

company.plugin(findOrCreate);

company.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

company.pre('save', function(next) {
  this.createdAt = +new Date();
  next();
});

company.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Companies', company);
