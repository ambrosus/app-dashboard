const fs = require('fs');
const crypto = require('crypto');

function decrypt(text, password) {
  const decipher = crypto.createDecipher('aes-256-ctr', password);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.'
    });
  }

  // Read the file
  let rawdata = fs.readFileSync(`${__dirname}/../accounts.json`);
  let accounts = JSON.parse(rawdata);

  let address, secret;

  emailExists = accounts.table.map(account => {
    if (account.email === email) {
      // Decrypt addressSecret
      let decrypted = decrypt(account.addressSecret, password);
      decrypted = decrypted.split('.');

      if (decrypted.length < 2) {
        return res.status(401).json({
          message: 'Email and password do not match.'
        });
      } else {
        address = decrypted[0];
        secret = decrypted[1];

        res.status(200).json({
          address: address,
          secret: secret,
          message: 'Success'
        });
      }
    }
  });
};
