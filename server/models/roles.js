/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const db = require('mongoose');

const roles = db.Schema({
  _id: {
    type: db.Schema.Types.ObjectId,
    auto: true,
  },
  title: {
    type: String,
    required: [(value) => !value, 'Title field is required'],
  },
  permissions: {
    type: [String],
    required: true,
    validate: [(value) => value.length > 0, 'Permissions cannot be blank'],
  },
  createdBy: {
    type: db.Schema.Types.ObjectId,
    ref: 'Users',
  },
  company: {
    type: db.Schema.Types.ObjectId,
    ref: 'Companies',
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

roles.plugin(require('mongoose-findorcreate'));
roles.plugin(require('mongoose-paginate'));
roles.plugin(_require('/models/pluggins/updatesAndErrors'));

module.exports = db.model('Roles', roles);
