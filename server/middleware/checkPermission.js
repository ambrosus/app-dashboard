/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const User = require('../models/users');
const Company = require('../models/companies');
const mongoose = require('mongoose');

module.exports = action => {
  return (req, res, next) => {
    try {
      const userId = req.session.user._id
      getUserObj(userId)
        .then(userObj => {
          checkOwnership(userObj)
            .then(response => {
              if (response === 1) {
                return next();
              } else if (response === 0) {
                // We know that this user is not an ownwer, 
                // We will check if the user has role
                // And if the role has the specific permission requested in the route

                if (userObj && userObj.role && userObj.role.permissions) {
                  let authorizedFlag = 0;
                  userObj.role.permissions
                    .forEach(permission => {
                      if (permission === action) {
                        authorizedFlag = 1;
                      }
                    });
                  if (authorizedFlag !== 1) { throw 'Unauthorized'; };

                  return next();

                } else { throw 'Unauthorized'; }

              }
            }).catch(error => { console.log('error: ' + error); return res.status(401).json({ message: error }); });
        }).catch(error => { throw 'No user found' });
    } catch (error) { return res.status(401).json({ message: error }); }
  }
};

getUserObj = userId => {
  return new Promise((resolve, reject) => {
    User.findById(userId)
      .populate('role')
      .then(userObj => {
        resolve(userObj);
      }).catch(error => { console.log('getUserObj error: ' + error);
        reject(error) });
  })
}

checkOwnership = userObject => {
  return new Promise((resolve, reject) => {
    if (userObject.company) {
      const _id = mongoose.Types.ObjectId(userObject.company);
      Company.findById({ _id })
        .then(companyResponse => {
          if (companyResponse.owner.equals(userObject._id)) {
            resolve(1);
          } else {
            resolve(0);
          }
        }).catch(error => { console.log('checkOwnership error: ' + error);
          reject(error) });
    } else { reject('No companyId inside user object') }
  })
}
