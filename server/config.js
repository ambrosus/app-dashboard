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
  token: 'eyJpZERhdGEiOnsiY3JlYXRlZEJ5IjoiMHhBMmVDRjhFODVENjBhMTQwMTI0NTRFNzZGNTU2ZEI5OTg3NzNDODIxIiwidmFsaWRVbnRpbCI6MTY5NjIzNTA1Nn0sInNpZ25hdHVyZSI6IjB4NDg1OWJmNzRiYzk3YmYzNmIwMjQ4NTY5YWU0MGY5NTkxZWMyMzgzZWVjY2JmOGQwMjU2Njc4YzM5MWY3ZGRhODUwODdiNzQ2NzIwZWI4YWFjMDQzNGI1MDQ2ODJhNWViNzgzNGFiYjliOWEyZjQ1NGI0ODYwODBlYTFiNzY3NjcxYyJ9',
  email: {
    API_KEY: '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',
  }
};
