/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const config = _require('/config');
const tokenEncrypt = _require('/utils/password');
const email = _require('/utils/email');
const inviteTemplate = _require('/assets/templates/email/invite.template.html');
const slug = require('slug');
const { to } = _require('/utils/general');
const { ValidationError, NotFoundError } = _require('/errors');

const Invite = _require('/models/invites');
const Organization = _require('/models/organizations');

/**
 * Create a new invite
 * Sends invitation emails
 *
 * @name createInvite
 * @route {POST} api/invites
 * @bodyparam invites, user
 * @returns Status code 400 on failure
 * @returns success message on success with status code 200
 */
exports.create = async (req, res, next) => {
  const { emails } = req.body;
  const user = req.user;
  let err, organization, insertedInvites, emailSent;

  if (emails && emails.length && user) {
    const invites = [];

    [err, organization] = await to(Organization.findById(user.organization._id));
    if (err || !organization) { logger.error('Organization GET error: ', err); return next(new NotFoundError(err.message)); }

    emails.map(email => {
      const invite = {};
      invite['_id'] = new mongoose.Types.ObjectId();
      invite['to'] = email;
      invite['from'] = mongoose.Types.ObjectId(user._id);
      invite['token'] = tokenEncrypt.encrypt(JSON.stringify({ email, createdAt: +new Date(), organization: user.organization._id }), config.secret);

      const url = `https://${req.get('host')}/signup?token=${invite['token']}`;
      const message = `<p style="text-align: left;width: 100%; color: #000; margin-bottom: 25px;">I would like to invite you to join our organizations dashboard.</p>`
      invite['html'] = inviteTemplate.replace(/@url/g, url).replace(/@message/g, message);
      invite['organization'] = organization;
      invites.push(invite);
    });

    [err, insertedInvites] = await to(Invite.insertMany(invites));
    if (err || !insertedInvites) { logger.error('Invites insert error: ', err); return next(new ValidationError(err.message)); }

    insertedInvites.map(async (invite) => {
      const invitation = JSON.parse(JSON.stringify(invite));
      invitation.subject = `${user.full_name} invited you to join ${user.organization.title || 'our'} dashboard`;
      invitation.from = `no-reply@${slug(user.organization.title || 'dashboard')}.com`;

      [err, emailSent] = await to(email.send(invitation));
      if (err || !emailSent) { logger.error('Email send error: ', err); }
    });

    req.status = 200;
    req.json = { data: null, message: 'Success', status: 200 };
    return next();

  } else if (!invites || !invites.length) {
    next(new ValidationError('"invites" need to be a non-empty array'));
  } else if (!user) {
    next(new ValidationError('"user" is required'));
  }
};

/**
 * Extracts token info on user signup
 *
 * @name extract
 * @bodyparam user
 * @queryparam inviteToken
 * @returns calls next();
 */
exports.extract = async (req, res, next) => {
  const { token } = req.body;
  let err, invite;

  [err, invite] = await to(
    Invite.findOne({ token })
    .populate('from')
    .populate({
      path: 'organization',
      select: '-active -createdAt -updatedAt -__v -owner'
    })
    .select('-active -createdAt -updatedAt -__v')
  );
  if (err || !invite) { logger.error('Invite GET error: ', err); return next(new NotFoundError('No invite', err)); }

  req.invite = invite;
  next();
}

/**
 * Delete multiple invites
 *
 * @name deleteInvites
 * @route {POST} api/invites/delete
 * @bodyparam ids
 * @returns Status code 400 on failure
 * @returns success message with data object on success with status code 200
 */
exports.delete = async (req, res, next) => {
  const ids = req.body.ids || [];
  const userID = req.user._id;
  let err, deleted;

  [err, deleted] = await to(Invite.deleteMany({ _id: { $in: ids }, from: userID }));
  if (err || !deleted) { logger.error('Invites delete error: ', err); return next(new ValidationError(err.message)); }

  req.status = 200;
  req.json = { data: deleted, message: 'Success', status: 200 };
  return next();
}

/**
 * Get all invites for a organization
 *
 * @name getAllInvites
 * @route {GET} api/invites/organization/:organization
 * @queryparams organization
 * @returns Status code 400 on failure
 * @returns array of invites & number of invites (length) on success with status code 200
 */
exports.getAll = async (req, res, next) => {
  const organization = req.user.organization._id;
  let err, invites;

  [err, invites] = await to(
    Invite.find({ organization })
    .populate({
      path: 'from',
      select: 'full_name email',
    })
  );
  if (err || !invites) { logger.error('Invites GET error: ', err); return next(new NotFoundError(err.message)); }

  req.status = 200;
  req.json = { data: invites, message: 'Success', status: 200 };
  return next();
};

/**
 * Verify an invite
 *
 * @name verifyInvite
 * @route {GET} api/invites/verify/:token
 * @queryparams token
 * @returns Status code 400 on failure
 * @returns success message on success with status code 200
 */
exports.verify = async (req, res, next) => {
  const token = req.params.token;
  let err, createdAt, deleted, invite, _token;
  try { _token = JSON.parse(tokenEncrypt.decrypt(token, config.secret)); } catch (error) { return next(new ValidationError('Token is invalid')); }
  const validUntil = 2 * 24 * 60 * 60 * 1000;

  if (+new Date() - _token.createdAt > validUntil) {
    [err, deleted] = await to(Invite.findOneAndRemove({ token }));
    if (err || !deleted) { logger.error('Invite DELETE error: ', err); return next(new ValidationError(err.message, err)); }
    return next(new ValidationError('Invite expired'));
  } else {
    [err, invite] = await to(
      Invite.findOne({ token })
      .populate('from')
      .populate({
        path: 'organization',
        select: '-active -createdAt -updatedAt -__v -owner'
      })
      .select('-active -createdAt -updatedAt -__v')
    );
    if (err || !invite) { logger.error('Invite GET error: ', err); return next(new NotFoundError('No invite', err)); }

    req.status = 200;
    req.json = { data: invite, message: 'Token is valid', status: 200 };
    return next();
  }
};
