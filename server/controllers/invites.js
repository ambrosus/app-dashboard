/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const config = require('../config');
const tokenEncrypt = require('../utils/password');
const email = require('../utils/email');

const Invite = require('../models/invites');
const Company = require('../models/companies');

exports.create = (req, res, next) => {
  const invites = req.body.invites;
  const user = req.body.user;

  if (invites && invites.length !== 0 && user) {
    Company.findById(user.company._id)
      .then(company => {
        if (company) {
          invites.map(invite => {
            invite['_id'] = new mongoose.Types.ObjectId();
            invite['from'] = mongoose.Types.ObjectId(user._id);
            invite['token'] = tokenEncrypt.encrypt(JSON.stringify({ email: invite.to, accessLevel: invite.accessLevel, permissions: invite.permissions, createdAt: +new Date(), company: user.company._id }), config.secret);

            const url = `https://${req.get('host')}/invite/${invite['token']}`;
            const message = invite['message'] ? `<p style="text-align: left;width: 100%; color: #000; margin-bottom: 25px;">${invite['message']}</p>` : '<!-- Message -->';
            invite['html'] =
              `<div style="font-family: sans-serif;padding: 75px 25px;background: #f1f5f4;width: 100%;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;">
                <div style="padding: 25px 25px;background: #fff;width: 100%;max-width: 500px; text-align: center;padding-bottom: 15px; margin: 0 auto;">
                  <h3 style="text-align: left;width: 100%; color: #000;">Hi,</h3>
                  ${message}
                  <p style="text-align: left;width: 100%; color: #000;" margin-bottom: 35px;>Please click on the button below to create an account:</p>
                  <a href="${url}" style="display:inline-block;padding: 12px 20px;background: #5078f1;color: #fff;font-size:12px;font-weight: 500;border-radius: 5px; text-decoration:none;" target="_blank">Create an account</a>
                  <p style="text-align: center;margin-top: 50px; color: #000; opacity: .4; width: 100%;">Ambrosus - all rights reserved, 2018.</p>
                </div>
              </div>`;
            invite['company'] = company;
          });

          Invite.insertMany(invites).then(invites => {
            invites.forEach(invite => {
              const invitation = JSON.parse(JSON.stringify(invite));
              invitation.subject = 'Create an account, Ambrosus Dashboard';
              invitation.from = 'no-reply@ambrosus.com';
              email.send(invitation)
                .then(sent => console.log('Email sent'))
                .catch(error => console.log('Email send error: ', error));
            });

            req.status = 200;
            req.json = { message: 'Success' };
            return next();
          }).catch(error => (console.log(error), res.status(400).json({ message: error })));

        } else { throw 'No company found'; }
      }).catch(error => (console.log(error), res.status(400).json({ message: error })));

  } else if (!invites || invites.length === 0) {
    return res.status(400).json({ message: '"invites" need to be a non-empty array.' })
  } else if (!user) {
    return res.status(400).json({ message: '"user" is required' })
  }
}

exports.delete = (req, res, next) => {
  const ids = req.body.ids || [];

  Invite.deleteMany({ _id: { $in: ids } })
    .then(deleted => {
      req.status = 200;
      req.json = { message: 'Successfuly deleted', data: deleted };
      return next();
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
}

exports.getAll = (req, res, next) => {
  const company = req.params.company;

  Invite.find({ company })
    .select('-__v')
    .then(invites => {
      req.status = 200;
      req.json = { resultCount: invites.length, data: invites };
      return next();
    }).catch(error => (console.log(error), res.status(400).json({ message: error })));
}

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
        }).catch(error => (console.log(error), res.status(400).json({ message: error })));
    } else {
      Invite.findOne({ token })
        .then(invite => {
          if (invite) {
            req.status = 200;
            req.json = { message: 'Token is valid' };
            return next();
          } else { throw 'No invite'; }
        }).catch(error => (console.log(error), res.status(404).json({ message: error })))
    }
  } else { return res.status(400).json({ message: 'Token is invalid' }) }
}
