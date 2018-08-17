const mongoose = require('mongoose');
const utilsPassword = require('../utils/password');

const Hermes = require('../models/hermeses');
const Company = require('../models/companies');
const User = require('../models/users');
const Role = require('../models/roles');

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
          // Find user
          User.findOne({ email })
            .then(user => {
              if (user) {
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
                          const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            full_name,
                            email,
                            company: createdCompany,
                            address,
                            token: utilsPassword.encrypt(`${address}|||${secret}`, password)
                          });

                          user
                            .save()
                            .then(createdUser => {

                              // Add a role to the user
                              Role.findOne({ id: 1 })
                              .then(role => {
                                if (role) {
                                  createdUser['role'] = role;
                                  createdUser.save();
                                } else {
                                  const role = new Role({
                                    title: 'admin',
                                    id: 1
                                  });
                                  role.save()
                                  .then(roleCreated => {
                                    createdUser['role'] = roleCreated;
                                    createdUser.save();
                                  });
                                }
                              }).catch(error => {
                                return res.status(400).json({ message: error });
                              });

                              // Add the user as company's owner
                              createdCompany['owner'] = createdUser;
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
    res.status(400).json({ message: '"address" is required' });
  } else if (!secret) {
    res.status(400).json({ message: '"secret" is required' });
  } else if (!full_name) {
    res.status(400).json({ message: '"full_name" is required' });
  } else if (!hermes) {
    res.status(400).json({ message: '"hermes" is required' });
  } else if (!title) {
    res.status(400).json({ message: '"title" is required' });
  } else if (!email) {
    res.status(400).json({ message: '"email" is required' });
  } else if (!password) {
    res.status(400).json({ message: '"password" is required' });
  }
};
