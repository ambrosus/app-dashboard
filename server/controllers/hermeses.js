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
  const title = req.body.title;
  const url = req.body.url;

  if (title && url) {
    Hermes.findOne({ url: url })
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
            .catch(error => {
              req.status = 400;
              req.json = { message: error };
              return next();
            });
        }
      })
      .catch(error => {
        req.status = 400;
        req.json = { message: error };
        return next();
      });
  } else if (!title) {
    req.status = 400;
    req.json = { message: '"title" is required' };
    return next();
  } else if (!url) {
    req.status = 400;
    req.json = { message: '"url" is required' };
    return next();
  }
};

exports.getAll = (req, res, next) => {
  const query = {
    public: true
  }

  Hermes.find(query)
    .then(results => {
      req.status = 200;
      req.json = {
        resultCount: results.length,
        data: results
      };
      return next();
    })
    .catch(error => {
      req.status = 400;
      req.json = { message: error };
      return next();
    });
};
