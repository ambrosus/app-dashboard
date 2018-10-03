/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const findOrCreate = require('mongoose-findorcreate');
const { ValidationError } = _require('/errors');
const { extractErrorMessage } = _require('/utils/general');

const assetsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  assetId: String,
  createdBy: String,
  infoEvent: String,
  latestEvent: String,
  createdAt: Date,
  updatedAt: Date
});

assetsSchema.plugin(mongoosePaginate);
assetsSchema.plugin(findOrCreate);

assetsSchema.post('save', function(err, doc, next) {
  if (err) { next(new ValidationError(extractErrorMessage(err), err)) } else { next(); }
});

assetsSchema.post('update', function(err, doc, next) {
  if (err) { next(new ValidationError(extractErrorMessage(err), err)) } else { next(); }
});

module.exports = mongoose.model('Assets', assetsSchema);
