/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const { to } = _require('/utils/general');
const { ValidationError } = _require('/errors');

const User = _require('/models/users');
const Organization = _require('/models/organizations');
const OrganizationRequest = _require('/models/organization-request');

/**
 * Create a new organization.
 *
 * @name create
 * @route {POST} api/companies
 * @bodyparam organization: { title, timeZone }
 * @returns Status code 400 on failure
 * @returns organization Object on success with status code 200
 */
exports.create = async (req, res, next) => {
  const organization = req.body.organization || {};
  const { title, settings } = organization;
  let err, organizationCreated;

  const query = {
    _id: new mongoose.Types.ObjectId(),
  };
  if (title) { query.title = title; }
  if (settings) { query.settings = settings; }
  [err, organizationCreated] = await to(Organization.create(query));
  if (err || !organizationCreated) { logger.error('Organization create error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.body.organization = organizationCreated;
  req.json = { data: organization, message: 'Success', status: 200 };
  return next();
};

exports.edit = async (req, res, next) => {
  const id = req.params.id;
  const query = req.body;
  let err, organizationUpdated;

  const update = {};
  const allowedToChange = ['title', 'settings'];
  for (const key in query) {
    if (allowedToChange.indexOf(key) > -1) update[key] = query[key];
  }

  [err, organizationUpdated] = await to(Organization.findByIdAndUpdate(id, update));
  if (err || !organizationUpdated) { logger.error('Organization update error: ', err); return next(new ValidationError(err.message, err)); }

  req.status = 200;
  req.json = { data: organizationUpdated, message: 'Success', status: 200 };
  return next();
}

exports.check = async (req, res, next) => {
  const { title } = req.query;
  let err, organization;

  [err, organization] = await to(Organization.findOne({ title }));

  req.status = organization ? 400 : 200;
  req.json = { data: null, message: `${organization ? 'Organization exists' : 'No organization'}`, status: req.status };
  return next();
}

exports.organizationRequest = async (req, res, next) => {
  const { email, address, title, message } = req.body;
  let err, accountExists, organizationExists, organizationRequestCreated;

  [err, accountExists] = await to(User.findOne({ email }));
  if (accountExists) { return next(new ValidationError('Account with this email already exists')); }

  [err, organizationExists] = await to(Organization.findOne({ title }));
  if (organizationExists) { return next(new ValidationError('Organization with this title already exists')) }

  req.body._id = new mongoose.Types.ObjectId();
  [err, organizationRequestCreated] = await to(OrganizationRequest.create(req.body));
  if (err) { return next(new ValidationError('Request create error', err)); }

  req.status = 201;
  req.json = { data: organizationRequestCreated, message: 'Success', status: req.status };
  return next();
}
