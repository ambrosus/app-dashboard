/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { to } = _require('/utils/general');
const { ValidationError, NotFoundError } = _require('/errors');
const Hermes = _require('/models/hermeses');

/**
 * Register a hermese node
 *
 * @name createHermeses
 * @route {POST} api/setup/
 * @bodyparam hermes: { title, url }
 * @returns Status code 400 on failure
 * @returns hermes Object on success with status code 200
 */
exports.create = async (req, res, next) => {
  const title = req.body.hermes ? req.body.hermes.title : null;
  const url = req.body.hermes ? req.body.hermes.url : null;
  let err, hermes;

  [err, hermes] = await to(Hermes.create({ title, url }));
  if (err || !hermes) { logger.error('Hermes create error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: hermes, message: 'Success', status: 200 };
  return next();
};

/**
 * Get all hermeses
 *
 * @name getAllHermeses
 * @route {GET} api/hermeses/
 * @returns Status code 400 on failure
 * @returns array of hermeses & number of hermeses (length) on success with status code 200
 */
exports.getAll = async (req, res, next) => {
  let err, hermeses;

  [err, hermeses] = await to(Hermes.paginate({ public: true }));
  if (err || !hermeses) { logger.error('Hermes find error: ', err); return next(new NotFoundError(err.message, err)); }

  req.status = 200;
  req.json = { data: hermeses, message: 'Success', status: 200 };
  return next();
};
