/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

module.exports = {
  db: process.env.MONGODB_URI,
  port: process.env.PORT || 5000,
  production: process.env.NODE_ENV ? process.env.NODE_ENV === 'production' : false,
  secret: process.env.SECRET,
  email: {
    API_KEY: process.env.EMAIL_API_KEY,
  }
};
