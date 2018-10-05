/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const mongoosePaginate = require('mongoose-paginate');
const updatesAndErrors = _require('/models/pluggins/updatesAndErrors');

const invites = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  to: {
    type: String,
    required: true
  },
  message: String,
  html: String,
  token: String,
  validUntil: {
    type: Date,
    default: +new Date() + 2 * 24 * 60 * 60 * 1000
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companies'
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

invites.plugin(findOrCreate);
invites.plugin(mongoosePaginate);
invites.plugin(updatesAndErrors);

module.exports = mongoose.model('Invites', invites);
