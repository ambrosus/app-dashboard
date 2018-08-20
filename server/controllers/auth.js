const utilsPassword = require('../utils/password');

const User = require('../models/users');

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email && password) {
    const query = { email };

    User.findOne(query)
      .populate({
        path: 'company',
        populate: [
          { path: 'hermes' }
        ]
      })
      .then(user => {
        if (user) {
          const [address, secret] = utilsPassword.decrypt(user.token, password).split('|||');

          if (address && secret) {
            req.status = 200;
            req.json = {
              user,
              address,
              secret
            };
            return next();
          } else {
            req.status = 401;
            req.json = { message: '"password" is incorrect' };
            return next();
          }
        } else {
          throw 'No user found';
        }
      })
      .catch(error => {
        req.status = 400;
        req.json = { message: error };
        return next();
      });
  } else if (!address) {
    req.status = 400;
    req.json = { message: '"address" is required'  };
    return next();
  } else if (!password) {
    req.status = 400;
    req.json = { message: '"password" is required' };
    return next();
  }
};

exports.logout = (req, res, next) => {

}

exports.signup = (req, res, next) => {

}

exports.changePassword = (req, res, next) => {
  const email = req.body.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  if (email && oldPassword && newPassword) {
    User.findOne({ email })
      .then(user => {
        if (user) {
          const [address, secret] = utilsPassword.decrypt(user.token, oldPassword).split('|||');

          if (address && secret) {
            user.token = utilsPassword.encrypt(`${address}|||${secret}`, newPassword);

            user
              .save()
              .then(saved => {
                req.status = 200;
                req.json = { message: 'Reset password success' };
                return next();
              })
              .catch(error => {
                req.status = 400;
                req.json = { message: 'Reset password failed' };
                return next();
              });
          } else {
            req.status = 401;
            req.json = { message: '"password" is incorrect' };
            return next();
          }
        } else {
          throw 'No user found';
        }
      })
      .catch(error => {
        req.status = 400;
        req.json = { message: error };
        return next();
      });
  } else if (!email) {
    req.status = 400;
    req.json = { message: '"email" is required' };
    return next();
  } else if (!oldPassword) {
    req.status = 400;
    req.json = { message: '"oldPassword" is required' };
    return next();
  } else if (!newPassword) {
    req.status = 400;
    req.json = { message: '"newPassword" is required' };
    return next();
  }
};
