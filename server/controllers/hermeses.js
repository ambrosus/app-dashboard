/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

const mongoose = require('mongoose');

const Hermes = require('../models/hermeses');

exports.create = (req, res, next) => {
  const title = req.body.hermesTitle;
  const url = req.body.hermesUrl;

  if (title && url) {
    Hermes.findOne({ url })
      .then(hermes => {
        if (hermes) {
          throw 'Hermes with this url already exists';
        } else {
          const hermes = new Hermes({
            _id: new mongoose.Types.ObjectId(),
            title,
            url
          });

          hermes
            .save()
            .then(created => {
              req.status = 200;
              req.json = {
                message: 'Hermes is registered',
                data: created
              };
              return next();
            })
            .catch(error => res.status(400).json({ message: error }));
        }
      })
      .catch(error => res.status(400).json({ message: error }));
  } else if (!title) {
    return res.status(400).json({ message: 'Hermes "title" is required' });
  } else if (!url) {
    return res.status(400).json({ message: 'Hermes "url" is required' });
  }
};

exports.getAll = (req, res, next) => {
  Hermes.find({ public: true })
    .then(results => {
      req.status = 200;
      req.json = {
        resultCount: results.length,
        data: results
      };
      return next();
    })
    .catch(error => res.status(400).json({ message: error }));
};
