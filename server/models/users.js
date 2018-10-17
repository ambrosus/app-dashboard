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
const mongoosePaginate = require('mongoose-paginate');
const updatesAndErrors = _require('/models/pluggins/updatesAndErrors');

const validateEmail = email => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const users = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companies',
  },
  full_name: String,
  email: {
    type: String,
    required: [value => !value, '"Email" field is required'],
    validate: [validateEmail, 'E-mail format is not valid'],
  },
  password: String,
  address: {
    type: String,
    required: [value => !value, '"Address" field is required'],
    validate: [web3.utils.isAddress, 'Address format is not valid'],
  },
  token: String,
  permissions: ['create_asset', 'create_event'],
  timeZone: String,
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
  },
});

users.plugin(findOrCreate);
users.plugin(mongoosePaginate);
users.plugin(updatesAndErrors);

users.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

module.exports = mongoose.model('Users', users);
