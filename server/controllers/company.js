const mongoose = require('mongoose');
const crypto = require('crypto');

const Hermes = require('../models/hermes');
const Company = require('../models/company');
const Person = require('../models/person');

function decrypt(text, password) {
  const decipher = crypto.createDecipher('aes-256-ctr', password);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function encrypt(text, password) {
  const cipher = crypto.createCipher('aes-256-ctr', password);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

exports.create = (req, res) => {
  const address = req.body.address;
  const secret = req.body.secret;
  const full_name = req.body.full_name;
  const hermes = req.body.hermes;
  const title = req.body.title;
  const email = req.body.email;
  const password = req.body.password;

  if (address && secret && full_name && hermes && title && email && password) {

    // Find Hermes
    Hermes.findById(hermes._id)
      .then(hermes => {
        if (hermes) {

          // Find Person
          Person.findOne({ email })
            .then(person => {
              if (person) {
                throw 'Email is already in use';
              } else {

                // Find Company
                Company.findOne({ title })
                  .then(c => {
                    if (c) {
                      throw 'Company with this title already exists';
                    } else {
                      const company = new Company({
                        _id: new mongoose.Types.ObjectId(),
                        title,
                        hermes
                      });

                      company
                        .save()
                        .then(created => {

                          // Create the Owner
                          const person = new Person({
                            _id: new mongoose.Types.ObjectId(),
                            full_name,
                            email,
                            company: created,
                            address,
                            token: encrypt(`${address}|||${secret}`, password),
                          });

                          person.save().then(created => {
                            return res.status(200).json({
                              message: 'Success',
                              data: created
                            })
                          }).catch(error => {
                            return res.status(400).json({ message: error });
                          });
                        })
                        .catch(error => {
                          return res.status(400).json({ message: error });
                        });
                    }
                  })
                  .catch(error => {
                    return res.status(400).json({ message: error });
                  });
              }
            })
            .catch(error => {
              return res.status(400).json({ message: error });
            });
        } else {
          throw 'Hermes not found';
        }
      })
      .catch(error => {
        res.status(400).json({ message: error });
      });
  } else if (!address) {
    res.status(400).json({ message: 'Address is required' });
  } else if (!secret) {
    res.status(400).json({ message: 'Secret is required' });
  } else if (!full_name) {
    res.status(400).json({ message: 'Full name is required' });
  } else if (!hermes) {
    res.status(400).json({ message: 'Hermes node is required' });
  } else if (!company) {
    res.status(400).json({ message: 'Title is required' });
  } else if (!email) {
    res.status(400).json({ message: 'Email is required' });
  } else if (!password) {
    res.status(400).json({ message: 'Password is required' });
  }
};
