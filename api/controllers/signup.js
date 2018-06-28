const fs = require('fs');
const crypto = require('crypto');

function encrypt(text, password) {
  const cipher = crypto.createCipher('aes-256-ctr', password);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

exports.signup = (req, res) => {
  const address = req.body.address;
  const secret = req.body.secret;
  const full_name = req.body.full_name;
  const company = req.body.company;
  const email = req.body.email;
  const password = req.body.password;

  if (!address || !secret || !full_name || !company || !email || !password) {
    return res.status(400).json({
      message:
        'Address, secret, full_name, company, email and password are all required.'
    });
  }

  const newAccount = {
    addressSecret: encrypt(`${address}.${secret}`, password),
    full_name: full_name,
    company: company,
    email: email
  };

  // Read the file
  let rawdata = fs.readFileSync(`${__dirname}/../accounts.json`);
  let accounts = JSON.parse(rawdata);

  emailExists = accounts.table.some(account => account.email === email);

  if (!emailExists) {
    accounts.table.push(newAccount);

    // Write to a file
    try {
      fs.writeFileSync(
        `${__dirname}/../accounts.json`,
        JSON.stringify(accounts)
      );
      console.log('Success in writing file');

      res.status(200).json({
        message: 'Signup successful'
      });
    } catch (err) {
      console.log('Error in writing file');
      console.log(err);

      res.status(400).json({
        message: 'Signup failed'
      });
    }
  } else {
    res.status(400).json({
      message: 'This email is already in use.'
    });
  }
};
