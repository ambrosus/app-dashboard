/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');

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
exports.create = (req, res, next) => {
  const title = req.body.company ? req.body.company.title : null;
  const settings = req.body.company ? req.body.company.settings : '';
  const hermes = req.hermes || req.body.hermes;

  Company.create({
      title,
      settings,
      hermes
    })
    .then(company => {
      req.status = 200;
      req.company = company;
      return next();
    }).catch(error => {
      if (error.code === 11000) { res.status(400).json({ message: 'Company with this title already exists' }); }
      else { console.log(error), res.status(400).json({ message: error }); }
    });
};

exports.edit = (req, res, next) => {
  const id = req.session.user.company || '';
  const query = req.body;

  const update = {}
  const allowedToChange = ['title', 'settings'];
  for (const key in query) {
    if (allowedToChange.indexOf(key) > -1) {
      update[key] = query[key]
    }
  }

  Company.findByIdAndUpdate(id, update)
    .then(updateResponse => {
      if (updateResponse) {
        req.status = 200;
        req.json = { message: 'Update data success', data: updateResponse };
        return next();
      } else { throw 'Update data error'; }
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
}
