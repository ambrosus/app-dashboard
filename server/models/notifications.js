/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const notificationsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  message: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  seen: {
    type: Boolean,
    required: false
  },
  createdAt: { type: Date, default: +new Date() },
  updatedAt: { type: Date, default: +new Date() }
});

notificationsSchema.plugin(findOrCreate);

notificationsSchema.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

notificationsSchema.pre('save', function(next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Notifications', notificationsSchema);
