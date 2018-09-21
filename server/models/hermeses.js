/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');

const hermesesSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  title: {
    type: String,
    required: [(value) => !value, 'Hermes "title" is required' ]
  },
  url: {
    type: String,
    required: [(value) => !value, 'Hermes "url" is required' ],
    index: { unique: true }
  },
  public: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: +new Date()
  },
  updatedAt: {
    type: Date,
    default: +new Date()
  }
});

hermesesSchema.pre('update', function (next) {
  this.updatedAt = +new Date();
  next();
});

hermesesSchema.pre('save', function (next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Hermeses', hermesesSchema);
