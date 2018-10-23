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

const organization = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  title: {
    type: String,
    index: { unique: true },
    minLength: 4,
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

organization.plugin(findOrCreate);
organization.plugin(mongoosePaginate);
organization.plugin(updatesAndErrors);

module.exports = mongoose.model('Organizations', organization);
