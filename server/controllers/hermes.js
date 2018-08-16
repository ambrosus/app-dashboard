const mongoose = require('mongoose');

const Hermes = require('../models/hermes');

exports.register = (req, res) => {
  const title = req.body.title;
  const url = req.body.url;
  const type = req.body.type;

  if (title && url && type && (type === 'dev' || type === 'test' || type === 'prod')) {
    Hermes.findOne({ url: url })
      .then(hermes => {
        if (hermes) {
          throw 'Hermes with this url already exists';
        } else {
          const hermes = new Hermes({
            _id: new mongoose.Types.ObjectId(),
            title,
            url,
            type
          });

          hermes
            .save()
            .then(created => {
              res.status(200).json({
                message: 'Hermes is registered',
                data: created
              });
            })
            .catch(error => {
              res.status(400).json({ message: error });
            });
        }
      })
      .catch(error => {
        res.status(400).json({ message: error });
      });
  } else if (!title) {
    res.status(400).json({ message: 'title is required' });
  } else if (!url) {
    res.status(400).json({ message: 'url is required' });
  } else if (!type) {
    res.status(400).json({ message: 'type is required' });
  } else if (!(type === 'dev' || type === 'test' || type === 'prod')) {
    res.status(400).json({ message: 'type needs to be either: dev, test or prod' });
  }
};

exports.getAll = (req, res) => {
  Hermes.find()
    .then(results => {
      res.status(200).json({
        resultCount: results.length,
        data: results
      });
    })
    .catch(error => {
      res.status(400).json({ message: error });
    });
};
