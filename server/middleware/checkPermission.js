/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { to } = _require('/utils/general');
const { PermissionError, NotFoundError } = _require('/errors');

const User = _require('/models/users');

module.exports = action => {
  return async (req, res, next) => {
    const address = req.body.address || req.params.address || req.query.address;
    let err, user;

    [err, user] = await to(User.findOne({ address }));
    if (err || !user) { return next(NotFoundError(err.message, err)); }

    if (user.permissions.indexOf(action) === -1) { return next(PermissionError('No permission')); }
    return next();
  }
};
