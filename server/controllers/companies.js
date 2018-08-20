const mongoose = require('mongoose');
const utilsPassword = require('../utils/password');

const Hermes = require('../models/hermeses');
const Company = require('../models/companies');
const User = require('../models/users');
const Role = require('../models/roles');

exports.create = (req, res, next) => {
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
                                    _id: new mongoose.Types.ObjectId(),
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
                                req.status = 400;
                                req.json = { message: error };
                                return next();
                              });

                              // Add the user as company's owner
                              createdCompany['owner'] = createdUser;
                              createdCompany
                                .save()
                                .then(success => {
                                  req.status = 200;
                                  req.json = { message: 'Success' };
                                  return next();
                                })
                                .catch(error => {
                                  console.log(error);
                                  req.status = 400;
                                  req.json = { message: error };
                                  return next();
                                });
                            })
                            .catch(error => {
                              console.log(error);
                              req.status = 400;
                              req.json = { message: error };
                              return next();
                            });
                        })
                        .catch(error => {
                          console.log(error);
                          req.status = 400;
                          req.json = { message: error };
                          return next();
                        });
                    }
                  })
                  .catch(error => {
                    console.log(error);
                    req.status = 400;
                    req.json = { message: error };
                    return next();
                  });
              }
            })
            .catch(error => {
              console.log(error);
              req.status = 400;
              req.json = { message: error };
              return next();
            });
        } else {
          throw 'Hermes not found';
        }
      })
      .catch(error => {
        console.log(error);
        req.status = 400;
        req.json = { message: error };
        return next();
      });
  } else if (!address) {
    req.status = 400;
    req.json = { message: '"address" is required' };
    return next();
  } else if (!secret) {
    req.status = 400;
    req.json = { message: '"secret" is required' };
    return next();
  } else if (!full_name) {
    req.status = 400;
    req.json = { message: '"full_name" is required' };
    return next();
  } else if (!hermes) {
    req.status = 400;
    req.json = { message: '"hermes" is required' };
    return next();
  } else if (!title) {
    req.status = 400;
    req.json = { message: '"title" is required' };
    return next();
  } else if (!email) {
    req.status = 400;
    req.json = { message: '"email" is required' };
    return next();
  } else if (!password) {
    req.status = 400;
    req.json = { message: '"password" is required' };
    return next();
  }
};
