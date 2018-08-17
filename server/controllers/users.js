const utilsPassword = require('../utils/password');

const User = require('../models/users');

exports.login = (req, res) => {
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
            res.status(200).json({
              user,
              address,
              secret
            });
          } else {
            return res.status(401).json({ message: '"password" is incorrect' });
          }
        } else {
          throw 'No user found';
        }
      })
      .catch(error => {
        return res.status(400).json({ message: error });
      });
  } else if (!address) {
    res.status(400).json({ message: '"address" is required' });
  } else if (!password) {
    res.status(400).json({ message: '"password" is required' });
  }
};

exports.getAccount = (req, res) => {
  const email = req.body.email;
  const address = req.body.address;

  if (email || address) {
    const query = email ? { email } : { address };

    User.findOne(query)
      .populate({
        path: 'company',
        populate: [
          { path: 'hermes' }
        ]
      })
      .then(user => {
        if (user) {
          res.status(200).json(user);
        } else {
          throw 'No user found';
        }
      })
      .catch(error => {
        return res.status(400).json({ message: error });
      });
  } else if (!(address || email)) {
    res.status(400).json({ message: '"email" or "address" is required' });
  }
}

exports.changePassword = (req, res) => {
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
                return res.status(200).json({ message: 'Reset password success' });
              })
              .catch(error => {
                return res.status(400).json({ message: 'Reset password failed' });
              });
          } else {
            return res.status(401).json({ message: '"password" is incorrect' });
          }
        } else {
          throw 'No user found';
        }
      })
      .catch(error => {
        return res.status(400).json({ message: error });
      });
  } else if (!email) {
    res.status(400).json({ message: '"email" is required' });
  } else if (!oldPassword) {
    res.status(400).json({ message: '"oldPassword" is required' });
  } else if (!newPassword) {
    res.status(400).json({ message: '"newPassword" is required' });
  }
};
