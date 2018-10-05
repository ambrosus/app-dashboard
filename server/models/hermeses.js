/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');
const validateUrl = (url) => {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
};
const mongoosePaginate = require('mongoose-paginate');
const updatesAndErrors = _require('/models/pluggins/updatesAndErrors');

const hermeses = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  title: {
    type: String,
    required: [(value) => !value, 'Hermes "title" is required'],
    minLength: 4,
  },
  url: {
    type: String,
    required: [(value) => !value, 'Hermes "url" is required'],
    index: { unique: true },
    validate: [validateUrl, 'URL format is not valid'],
  },
  public: {
    type: Boolean,
    default: true,
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

hermeses.plugin(findOrCreate);
hermeses.plugin(mongoosePaginate);
hermeses.plugin(updatesAndErrors);

module.exports = mongoose.model('Hermeses', hermeses);
