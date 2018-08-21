/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const sgMail = require('@sendgrid/mail');
const config = require('../config');
sgMail.setApiKey(config.email.API_KEY);
exports.send = (req, res, next) =>
{
    const from = req.body.from;
    const to = req.body.to;
    const subject = req.body.subject;
    const html = req.body.html;
    if (to && from && subject && html)
    {
        const msg = {
            from,
            to,
            subject,
            html
        };
        sgMail
            .send(msg)
            .then(() =>
            {
                req.status = 200;
                req.json = {
                    message: 'Success'
                };
                return next();
            })
            .catch(error =>
            {
                console.error('Email send error: ', JSON.stringify(error, null, 2));
                req.status = 400;
                req.json = {
                    message: error
                };
                return next();
            });
    }
    else if (!from)
    {
        req.status = 400;
        req.json = {
            message: '"from" is required.'
        };
        return next();
    }
    else if (!to)
    {
        req.status = 400;
        req.json = {
            message: '"to" is required.'
        };
        return next();
    }
    else if (!subject)
    {
        req.status = 400;
        req.json = {
            message: '"subject" is required.'
        };
        return next();
    }
    else if (!html)
    {
        req.status = 400;
        req.json = {
            message: '"html" (email message/body) is required.'
        };
        return next();
    }
};
