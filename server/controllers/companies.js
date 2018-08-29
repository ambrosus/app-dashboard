/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');

const Company = require('../models/companies');

exports.create = (req, res, next) => {
  const title = req.body.company ? req.body.company.title : null;
  const timeZone = req.body.company ? req.body.company.timeZone : null;
  const hermes = req.body.hermes || req.json ? req.json.hermes : null;

  if (title && timeZone && hermes) {
    Company.findOne({ title })
      .then(company => {
        if (company) {
          throw 'Company with this title already exists';
        } else {
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
              req.json = req.json ? req.json.company = company : req.json = { company };
              return next();
            }).catch(error => res.status(400).json({ message: error }));
        }
      }).catch(error => res.status(400).json({ message: error }));
  } else if (!title) {
    return res.status(400).json({ message: 'Company "companyTitle" is required' });
  } else if (!timeZone) {
    return res.status(400).json({ message: 'Company "companyTimeZone" is required' });
  } else if (!hermes) {
    return res.status(400).json({ message: '"hermes" is required' });
  }
}
