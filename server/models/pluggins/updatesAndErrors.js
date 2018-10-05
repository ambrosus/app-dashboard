/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { ValidationError } = _require('/errors');
const { extractErrorMessage } = _require('/utils/general');

module.exports = exports = function UpdatesAndErrors(schema, options) {
  // PRE
  schema.pre('save', function(next) {
    this.updatedAt = +new Date();
    next();
  });
  schema.pre('update', function(next) {
    this.updatedAt = +new Date();
    next();
  });
  schema.pre('updateOne', function(next) {
    this.updatedAt = +new Date();
    next();
  });
  schema.pre('findOneAndUpdate', function(next) {
    this.updatedAt = +new Date();
    next();
  });

  // POST
  schema.post('save', function(err, doc, next) {
    if (err) { next(new ValidationError(extractErrorMessage(err), err)) } else { next(); }
  });
  schema.post('update', function(err, doc, next) {
    if (err) { next(new ValidationError(extractErrorMessage(err), err)) } else { next(); }
  });
  schema.post('updateOne', function(err, doc, next) {
    if (err) { next(new ValidationError(extractErrorMessage(err), err)) } else { next(); }
  });
  schema.post('findOneAndUpdate', function(err, doc, next) {
    if (err) { next(new ValidationError(extractErrorMessage(err), err)) } else { next(); }
  });
}
