const mongoose = require('mongoose');

const Hermes = require('../models/hermeses');

exports.create = (req, res) => {
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
    res.status(400).json({ message: '"title" is required' });
  } else if (!url) {
    res.status(400).json({ message: '"url" is required' });
  }
};

exports.getAll = (req, res) => {
  const query = {
    public: true
  }

  Hermes.find(query)
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
