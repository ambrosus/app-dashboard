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
const Company = _require('/models/companies');

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
  const { invites, user } = req.body;
  let err, company, insertedInvites, emailSent;

  if (invites && invites.length !== 0 && user) {
    [err, company] = await to(Company.findById(user.company._id));
    if (err || !company) { logger.error('Company GET error: ', err); return next(new NotFoundError(err.message)); }

    invites.map(invite => {
      invite['_id'] = new mongoose.Types.ObjectId();
      invite['from'] = mongoose.Types.ObjectId(user._id);
      invite['token'] = tokenEncrypt.encrypt(JSON.stringify({ email: invite.to, accessLevel: invite.accessLevel, role: invite.role, createdAt: +new Date(), company: user.company._id }), config.secret);

      const url = `https://${req.get('host')}/invite/${invite['token']}`;
      const message = invite['message'] ? `<p style="text-align: left;width: 100%; color: #000; margin-bottom: 25px;">${invite['message']}</p>` : '<!-- Message -->';
      invite['html'] = inviteTemplate.replace(/@url/g, url).replace(/@message/g, message);
      invite['company'] = company;
    });

    [err, insertedInvites] = await to(Invite.insertMany(invites));
    if (err || !insertedInvites) { logger.error('Invites insert error: ', err); return next(new ValidationError(err.message)); }

    insertedInvites.map(async (invite) => {
      const invitation = JSON.parse(JSON.stringify(invite));
      invitation.subject = `${user.full_name} invited you to join ${user.company.title} Dasbhoard`;
      invitation.from = `no-reply@${slug(user.company.title)}.com`;

      [err, emailSent] = await to(email.send(invitation));
      if (err || !emailSent) { logger.error('Email send error: ', err); }
      if (emailSent) logger.info('Email send success: ', emailSent);
    });

    req.status = 200;
    req.json = { data: null, message: 'Success', status: 200 };
    return next();

  } else if (!invites || invites.length === 0) {
    next(new ValidationError('"invites" need to be a non-empty array'));
  } else if (!user) {
    next(new ValidationError('"user" is required'));
  }
};

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
  const userId = req.session.user._id;
  let err, deleted;

  [err, deleted] = await to(Invite.deleteMany({ _id: { $in: ids }, from: userId }));
  if (err || !deleted) { logger.error('Invites delete error: ', err); return next(new ValidationError(err.message)); }

  req.status = 200;
  req.json = { data: deleted, message: 'Success', status: 200 };
  return next();
}

/**
 * Get all invites for a company
 *
 * @name getAllInvites
 * @route {GET} api/invites/company/:company
 * @queryparams company
 * @returns Status code 400 on failure
 * @returns array of invites & number of invites (length) on success with status code 200
 */
exports.getAll = async (req, res, next) => {
  const company = req.params.company;
  let err, invites;

  [err, invites] = await to(
    Invite.find({ company })
    .populate({
      path: 'from',
      select: 'full_name email'
    })
  );
  if (err || !invites) { logger.error('Invites GET error: ', err); return next(new NotFoundError(err.message)); }

  req.status = 200;
  req.json = { data: invites, message: 'Success', status: 200 };
  return next();
}

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
  let createdAt, deleted, invite;
  try { createdAt = JSON.parse(tokenEncrypt.decrypt(token, config.secret))['createdAt']; } catch (error) {}
  const validUntil = 2 * 24 * 60 * 60 * 1000;

  if (createdAt) {
    if (+new Date() - createdAt > validUntil) {
      [err, deleted] = await to(Invite.findOneAndRemove({ token }));
      if (err || !deleted) { logger.error('Invite DELETE error: ', err); return next(new ValidationError(err, err)); }
      return next(new ValidationError('Invite expired'));
    } else {
      [err, invite] = await to(Invite.findOne({ token }));
      if (err || !invite) { logger.error('Invite GET error: ', err); return next(new NotFoundError(err, err)); }

      req.status = 200;
      req.json = { data: invite, message: 'Token is valid', status: 200 };
      return next();
    }
  } else { return next(new ValidationError('Token is invalid')); }
}
