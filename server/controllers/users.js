const User = require('../models/users');

exports.getAccount = (req, res, next) => {
  const address = req.params.address;

  if (address) {
    const query = { address };

    User.findOne(query)
      .populate({
        path: 'company',
        populate: [
          { path: 'hermes' }
        ]
      })
      .then(user => {
        if (user) {
          req.status = 200;
          req.json = user;
          return next();
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
    req.json = { message: '"address" is required' };
    return next();
  }
}

exports.getAccounts = (req, res, next) => {

}

exports.editInfo = (req, res, next) => {

}

exports.getSettings = (req, res, next) => {

}

exports.getNotifications = (req, res, next) => {

}
