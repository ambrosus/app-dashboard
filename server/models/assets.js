/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

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

module.exports = mongoose.model('Assets', assetsSchema);
