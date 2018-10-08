/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const { to } = _require('/utils/general');
const { ValidationError } = _require('/errors');

const Company = _require('/models/companies');

/**
 * Create a new company.
 *
 * @name createCompany
 * @route {POST} api/companies
 * @bodyparam company: { title, timeZone }, hermes
 * @returns Status code 400 on failure
 * @returns company Object on success with status code 200
 */
exports.create = async (req, res, next) => {
  const title = req.body.company ? req.body.company.title : req.body.title;
  const settings = req.body.company ? req.body.company.settings : req.body.settings;
  const hermes = req.hermes || req.body.hermes;
  let err, company;

  [err, company] = await to(Company.create({ title, settings, hermes }));
  if (err || !company) { logger.error('Company create error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: company, message: 'Success', status: 200 };
  return next();
};

exports.edit = async (req, res, next) => {
  const id = req.session.user.company || '';
  const query = req.body;
  let err, companyUpdated;

  const update = {};
  const allowedToChange = ['title', 'settings'];
  for (const key in query) {
    if (allowedToChange.indexOf(key) > -1) update[key] = query[key];
  }

  [err, companyUpdated] = await to(Company.findByIdAndUpdate(id, update));
  if (err || !companyUpdated) { logger.error('Company update error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: companyUpdated, message: 'Success', status: 200 };
  return next();
}
