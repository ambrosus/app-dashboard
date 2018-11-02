/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { to } = _require('/utils/general');
const { PermissionError, ValidationError } = _require('/errors');
const moment = require('moment');

const User = _require('/models/users');

module.exports = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) { return next(); }

    token = token.split('AMB_TOKEN ');
    token = Buffer.from(token[1], 'base64').toString();
    token = JSON.parse(token);
    const { createdBy, validUntil } = token.idData;

    if (!moment(validUntil * 1000).diff(moment(), 'days')) {
      return next(new ValidationError('Token has expired'));
    }

    [err, user] = await to(
      User.findOne({ address: createdBy })
      .populate({
        path: 'organization',
        select: '-createdAt -updatedAt -__v -owner'
      })
      .select('-createdAt -updatedAt -password -__v')
    );
    if (err || !user) { return next(new ValidationError('User not found', err)); }

    req.user = user;
    return next();
  } catch (e) { console.log(e); return next(new PermissionError('Invalid token')); }
};
