/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
exports.to = promise => promise.then(data => [null, data]).catch(err => [err]);

exports.extractErrorMessage = error => {
  if (!error.errors) return error.message;
  let message = '';
  Object.keys(error.errors).map(key => message += `${error.errors[key].message}. `);
  return message;
}
