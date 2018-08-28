/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

module.exports = (req, res, next) => {
  try {
    const address = req.body.address || req.params.address || req.query.address;
    const session = req.session;

    if (!session || !session.user || address !== session.user.address) {
      throw 'Unauthorized';
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: error });
  }
};
