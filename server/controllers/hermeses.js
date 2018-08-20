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
