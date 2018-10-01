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
const slug = require('slug')

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
exports.create = (req, res, next) => {
  const { invites, user } = req.body;

  if (invites && invites.length !== 0 && user) {
    Company.findById(user.company._id)
      .then(company => {
        if (company) {
          invites.map(invite => {
            invite['_id'] = new mongoose.Types.ObjectId();
            invite['from'] = mongoose.Types.ObjectId(user._id);
            invite['token'] = tokenEncrypt.encrypt(JSON.stringify({ email: invite.to, accessLevel: invite.accessLevel, role: invite.role, createdAt: +new Date(), company: user.company._id }), config.secret);

            const url = `https://${req.get('host')}/invite/${invite['token']}`;
            const message = invite['message'] ? `<p style="text-align: left;width: 100%; color: #000; margin-bottom: 25px;">${invite['message']}</p>` : '<!-- Message -->';
            invite['html'] = inviteTemplate.replace(/@url/g, url).replace(/@message/g, message);
            invite['company'] = company;
          });

          Invite.insertMany(invites).then(invites => {
            invites.forEach(invite => {
              const invitation = JSON.parse(JSON.stringify(invite));
              invitation.subject = `${user.full_name} invited you to join ${user.company.title} Dasbhoard`;
              invitation.from = `no-reply@${slug(user.company.title)}.com`;
              email.send(invitation)
                .then(sent => console.log('Email sent'))
                .catch(error => console.log('Email send error: ', error));
            });

            req.status = 200;
            req.json = { message: 'Success' };
            return next();
          }).catch(error => (console.log(error), res.status(400).json({ message: 'Creating invites error' })));

        } else { throw 'No company found'; }
      }).catch(error => (console.log(error), res.status(400).json({ message: 'Company GET error' })));

  } else if (!invites || invites.length === 0) {
    return res.status(400).json({ message: '"invites" need to be a non-empty array.' })
  } else if (!user) {
    return res.status(400).json({ message: '"user" is required' })
  }
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
exports.delete = (req, res, next) => {
  const ids = req.body.ids || [];
  const userId = req.session.user._id;

  Invite.deleteMany({ _id: { $in: ids }, from: userId })
    .then(deleted => {
      req.status = 200;
      req.json = { message: 'Successfuly deleted', data: deleted };
      return next();
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Delete invite error' })));
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
exports.getAll = (req, res, next) => {
  const company = req.params.company;

  Invite.find({ company })
    .populate('from')
    .select('-__v')
    .then(invites => {
      req.status = 200;
      req.json = { resultCount: invites.length, data: invites };
      return next();
    }).catch(error => (console.log(error), res.status(400).json({ message: 'Invites GET error' })));
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
exports.verify = (req, res, next) => {
  const token = req.params.token;
  let createdAt;
  try { createdAt = JSON.parse(tokenEncrypt.decrypt(token, config.secret))['createdAt']; } catch (error) {}
  const validUntil = 2 * 24 * 60 * 60 * 1000;

  if (createdAt) {
    if (+new Date() - createdAt > validUntil) {
      Invite.findOneAndRemove({ token })
        .then(deleted => {
          return res.status(400).json({ message: 'Invitation expired' });
        }).catch(error => (console.log(error), res.status(400).json({ message: 'Invite remove error' })));
    } else {
      Invite.findOne({ token })
        .then(invite => {
          if (invite) {
            req.status = 200;
            req.json = { message: 'Token is valid' };
            return next();
          } else { throw 'No invite'; }
        }).catch(error => (console.log(error), res.status(404).json({ message: 'Invite GET error' })))
    }
  } else { return res.status(400).json({ message: 'Token is invalid' }) }
}
