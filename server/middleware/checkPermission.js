/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { to } = _require('/utils/general');
const { PermissionError, ValidationError } = _require('/errors');

const User = _require('/models/users');

module.exports = (action = '') => {
  return async (req, res, next) => {
    try {
      const { permissions } = req.user;

      if (action && !permissions.includes(action)) { return next(new PermissionError('No permission')); }

      return next();
    } catch (e) { return next(new PermissionError('No token provided')); }
  }
};
