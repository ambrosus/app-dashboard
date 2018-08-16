const mongoose = require('mongoose');
const utilsPassword = require('../utils/password');

const Hermes = require('../models/hermes');
const Company = require('../models/company');
const Person = require('../models/person');

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
                        .then(createdCompany => {
                          // Create the Owner
                          const person = new Person({
                            _id: new mongoose.Types.ObjectId(),
                            full_name,
                            email,
                            company: createdCompany,
                            address,
                            token: utilsPassword.encrypt(`${address}|||${secret}`, password)
                          });

                          person
                            .save()
                            .then(createdPerson => {
                              createdCompany['owner'] = createdPerson;
                              createdCompany
                                .save()
                                .then(success => {
                                  return res.status(200).json({
                                    message: 'Success'
                                  });
                                })
                                .catch(error => {
                                  console.log(error);
                                  return res.status(400).json({ message: error });
                                });
                            })
                            .catch(error => {
                              console.log(error);
                              return res.status(400).json({ message: error });
                            });
                        })
                        .catch(error => {
                          console.log(error);
                          return res.status(400).json({ message: error });
                        });
                    }
                  })
                  .catch(error => {
                    console.log(error);
                    return res.status(400).json({ message: error });
                  });
              }
            })
            .catch(error => {
              console.log(error);
              return res.status(400).json({ message: error });
            });
        } else {
          throw 'Hermes not found';
        }
      })
      .catch(error => {
        console.log(error);
        res.status(400).json({ message: error });
      });
  } else if (!address) {
    res.status(400).json({ message: 'address is required' });
  } else if (!secret) {
    res.status(400).json({ message: 'secret is required' });
  } else if (!full_name) {
    res.status(400).json({ message: 'full_name is required' });
  } else if (!hermes) {
    res.status(400).json({ message: 'hermes is required' });
  } else if (!title) {
    res.status(400).json({ message: 'title is required' });
  } else if (!email) {
    res.status(400).json({ message: 'email is required' });
  } else if (!password) {
    res.status(400).json({ message: 'password is required' });
  }
};
