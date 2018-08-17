const sgMail = require('@sendgrid/mail');
const config = require('../config');

sgMail.setApiKey(config.email.API_KEY);

exports.send = (req, res) => {
  const from = req.body.from;
  const to = req.body.to;
  const subject = req.body.subject;
  const html = req.body.html;

  if (to && from && subject && html) {
    const msg = {
      from,
      to,
      subject,
      html
    };

    sgMail
      .send(msg)
      .then(() => {
        res.status(200).json({ message: 'success' });
      })
      .catch(error => {
        console.error('Email send error: ', JSON.stringify(error, null, 2));
        res.status(400).json({ message: error });
      });
  } else if (!from) {
    res.status(400).json({ message: '"from" is required.' });
  } else if (!to) {
    res.status(400).json({ message: '"to" is required.' });
  } else if (!subject) {
    res.status(400).json({ message: '"subject" is required.' });
  } else if (!html) {
    res.status(400).json({ message: '"html" (email message/body) is required.' });
  }
};