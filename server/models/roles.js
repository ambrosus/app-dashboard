/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');

const rolesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: [(value) => !value, 'Title field is required' ]
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

rolesSchema.pre('updateOne', function(next) {
  this.updatedAt = +new Date();
  if (!this.getQuery()._id) { next(new Error('_id field is required to update role').toString()); }
  else if (!this.getUpdate().title) { next(new Error('Title field is required to update role').toString()); }
  else if (!this.getUpdate().permissions) { next(new Error('Permissions field is required to update role').toString()); }
  else if (this.getUpdate().permissions.length === 0) { next(new Error('Permissions array cannot be empty').toString()); }
  else { next(); }
});

rolesSchema.pre('save', function(next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Roles', rolesSchema);
