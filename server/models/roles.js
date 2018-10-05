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

const roles = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  title: {
    type: String,
    required: [(value) => !value, 'Title field is required']
  },
  permissions: {
    type: [String],
    required: true,
    validate: [(value) => value.length > 0, 'Permissions cannot be blank']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
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

roles.plugin(findOrCreate);
roles.plugin(mongoosePaginate);
roles.plugin(updatesAndErrors);

module.exports = mongoose.model('Roles', roles);
