/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');

const Company = require('../models/companies');

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
  const timeZone = req.body.company ? req.body.company.timeZone : '';
  const hermes = req.hermes || req.body.hermes;

  if (title && hermes) {
    const company = new Company({
      _id: new mongoose.Types.ObjectId(),
      title,
      timeZone,
      hermes
    });
    company
      .save()
      .then(company => {
        req.status = 200;
        req.company = company;
        return next();
      }).catch(error => {
        if (error.code === 11000) { res.status(400).json({ message: 'Company with this title already exists' }); }
        else { console.log(error), res.status(400).json({ message: error }); }
      });
  } else if (!title) {
    return res.status(400).json({ message: 'Company "title" is required' });
  } else if (!hermes) {
    return res.status(400).json({ message: '"hermes" object is required' });
  }
}
