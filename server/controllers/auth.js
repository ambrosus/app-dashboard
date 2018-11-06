/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { to } = _require('/utils/general');
const { ValidationError } = _require('/errors');
const { httpGet } = _require('/utils/requests');
const { token, api } = _require('/config');

const User = _require('/models/users');

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let err, user;

  if (email && password) {
    [err, user] = await to(
      User.findOne({ email })
      .populate({
        path: 'organization',
        select: '-__v -owner'
      })
      .select('-createdAt -updatedAt -__v')
    );
    if (err || !user) { logger.error('User GET error: ', err); return next(new ValidationError('No user found', err)); }

    if (user && !(user.active && user.organization.active)) { return next(new ValidationError('User is deactivated')); }

    req.status = 200;
    req.json = { data: user.token, message: 'Success', status: 200 };
    return next();

  } else if (!email) {
    next(new ValidationError('User "email" is required'));
  } else if (!password) {
    next(new ValidationError('User "password" is required'));
  }
};

exports.verifyAccount = async (req, res, next) => {
  const { address } = req.body;
  let err, verified, user;

  [err, verified] = await to(httpGet(`${api.core}/accounts/${address}`, token));
  if (err || !verified) {
    return next(new ValidationError((err && err.data) ? err.data.reason : 'Verification failed'));
  }

  [err, user] = await to(
    User.findOne({ address })
    .populate({
      path: 'organization',
      select: '-__v -owner'
    })
    .select('-createdAt -updatedAt -__v')
  );
  if (err) { logger.error('User GET error: ', err); }
  if (user && !(user.active && user.organization.active)) { return next(new ValidationError('User is deactivated')); }

  req.status = 200;
  req.json = { data: `${ user ? user.token : null}`, message: 'Success', status: 200 };
  return next();
};
