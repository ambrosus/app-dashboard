/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/

/* global _require */
/* global logger */

const Hermes = _require('/models/hermeses');

/**
 * Register a hermese node
 *
 * @name createHermeses
 * @route {POST} api/setup/
 * @bodyparam hermes: { title, url }
 * @returns Status code 400 on failure
 * @returns hermes Object on success with status code 200
 */
exports.create = (req, res, next) => {
  const title = req.body.hermes ? req.body.hermes.title : req.body.title;
  const url = req.body.hermes ? req.body.hermes.url : req.body.url;

  Hermes.create({
    title,
    url,
  })
    .then(hermes => {
      req.status = 200;
      req.hermes = hermes;
      return next();
    }).catch(error => {
      logger.error(error);
      res.status(400).json({ message: error });
    });
};

/**
 * Get all hermeses
 *
 * @name getAllHermeses
 * @route {GET} api/hermeses/
 * @returns Status code 400 on failure
 * @returns array of hermeses & number of hermeses (length) on success with status code 200
 */
exports.getAll = (req, res, next) => {
  Hermes.find({ public: true })
    .then((hermeses = []) => {
      req.status = 200;
      req.json = {
        totalCount: hermeses.length,
        data: hermeses,
        message: 'Success',
      };

      return next();
    }).catch(error => {
      logger.error(error);
      res.status(400).json({ message: error });
    });
};
