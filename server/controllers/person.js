const utilsPassword = require('../utils/password');

const Person = require('../models/person');

exports.login = (req, res) => {
  const email = req.body.email;
  const address = req.body.address;
  const password = req.body.password;

  if ((email || address) && password) {
    const query = email ? { email } : { address };

    Person.findOne(query)
      .populate({
        path: 'company',
        populate: [
          { path: 'hermes' }
        ]
      })
      .then(person => {
        if (person) {
          const [address, secret] = utilsPassword.decrypt(person.token, password).split('|||');

          if (address && secret) {
            res.status(200).json({
              person,
              address,
              secret
            });
          } else {
            return res.status(401).json({ message: 'password is incorrect' });
          }
        } else {
          throw 'No account found';
        }
      })
      .catch(error => {
        return res.status(400).json({ message: error });
      });
  } else if (!(email || address)) {
    res.status(400).json({ message: 'email or address is required' });
  } else if (!password) {
    res.status(400).json({ message: 'password is required' });
  }
};

exports.account = (req, res) => {
  const address = req.params.address;

  if (address) {
    const query = { address };

    Person.findOne(query)
      .populate({
        path: 'company',
        populate: [
          { path: 'hermes' }
        ]
      })
      .then(person => {
        if (person) {
          res.status(200).json(person);
        } else {
          throw 'No account found';
        }
      })
      .catch(error => {
        return res.status(400).json({ message: error });
      });
  } else if (!address) {
    res.status(400).json({ message: 'address is required' });
  }
}

exports.resetpassword = (req, res) => {
  const email = req.body.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  if (email && oldPassword && newPassword) {
    Person.findOne({ email })
      .then(person => {
        if (person) {
          const [address, secret] = utilsPassword.decrypt(person.token, oldPassword).split('|||');

          if (address && secret) {
            person.token = utilsPassword.encrypt(`${address}|||${secret}`, newPassword);

            person
              .save()
              .then(saved => {
                return res.status(200).json({ message: 'Reset password success' });
              })
              .catch(error => {
                return res.status(400).json({ message: 'Reset password failed' });
              });
          } else {
            return res.status(401).json({ message: 'password is incorrect' });
          }
        } else {
          throw 'No account found';
        }
      })
      .catch(error => {
        return res.status(400).json({ message: error });
      });
  } else if (!email) {
    res.status(400).json({ message: 'email is required' });
  } else if (!oldPassword) {
    res.status(400).json({ message: 'oldPassword is required' });
  } else if (!newPassword) {
    res.status(400).json({ message: 'newPassword is required' });
  }
};
