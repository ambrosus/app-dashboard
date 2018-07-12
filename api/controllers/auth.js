const fs = require('fs');
const crypto = require('crypto');

function decrypt(text, password) {
  const decipher = crypto.createDecipher('aes-256-ctr', password);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function encrypt(text, password) {
  const cipher = crypto.createCipher('aes-256-ctr', password);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

exports.resetpassword = (req, res) => {
  const email = req.body.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.password;

  if (!req.body.email || !req.body.oldPassword || !req.body.password ) {
    return res.status(401).json({
      message: 'Required fields are not present'
    });
  } else {

    // Read the file
    let rawdata = fs.readFileSync(`${__dirname}/../accounts.json`);
    let accounts = JSON.parse(rawdata);

    emailExists = accounts.some(account => account.email === email);

    if (!emailExists) {
      return res.status(400).json({
        email: false,
        message: 'Email Address is not registered'
      });
    } else {

      let address, secret;
      let newAccountData;

      emailExists = accounts.map(account => {
        if (account.email === email) {
          // Decrypt addressSecret
          let decrypted = decrypt(account.token, oldPassword);
          decrypted = decrypted.split('|||');

          if (decrypted.length < 2) {
            return res.status(401).json({
              message: 'Incorrect password'
            });
          } else {
            // Reset the password here
            address = decrypted[0];
            secret = decrypted[1];

            // Resign with newPassword
            const token = encrypt(`${address}|||${secret}`, newPassword);
            account.token = token;
            newAccountData = account;

            let updatedAccounts = [];

            // Remove the old token from the json
            updatedAccounts = accounts.filter((account) => { return account.email !== req.body.email });
            // Add the new token to the json
            updatedAccounts.push(newAccountData);

            // Save the json to accounts.json file
            try {
              fs.writeFileSync(
                `${__dirname}/../accounts.json`,
                JSON.stringify(updatedAccounts)
              );
              console.log('Success in writing file');
              res.status(200).json({
                message: 'Reset password succesfull'
              });
            } catch (err) {
                console.log('Error in writing file');
                console.log(err);
                res.status(400).json({
                  message: 'Reset password failed',
                  error: err
                });
            }
          }
        }
      });
    }
  }
}

exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.'
    });
  }

  if (!fs.existsSync(`${__dirname}/../accounts.json`)) {
    return res.status(400).json({
      message: 'You have to signup first.'
    });
  }

  // Read the file
  let rawdata = fs.readFileSync(`${__dirname}/../accounts.json`);
  let accounts = JSON.parse(rawdata);

  let address, secret;

  accounts.map(account => {
    if (account.email === email) {
      // Decrypt addressSecret
      let decrypted = decrypt(account.token, password);
      decrypted = decrypted.split('|||');

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
    token: encrypt(`${address}|||${secret}`, password),
    full_name: full_name,
    company: company,
    email: email,
    address: address
  };

  // Read the file
  if (fs.existsSync(`${__dirname}/../accounts.json`)) {
    let rawdata = fs.readFileSync(`${__dirname}/../accounts.json`);
    let accounts = JSON.parse(rawdata);

    emailExists = accounts.some(account => account.email === email);

    if (!emailExists) {
      accounts.push(newAccount);

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
  } else {
    fs.writeFile(
      `${__dirname}/../accounts.json`,
      JSON.stringify([]),
      function(error, data) {
        if (error) {
          return res.status(400).json({
            message: 'Error occured.'
          });
        }

        let rawdata = fs.readFileSync(`${__dirname}/../accounts.json`);
        let accounts = JSON.parse(rawdata);

        accounts.push(newAccount);

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
      }
    );
  }
};

exports.accounts = (req, res) => {
  if (!fs.existsSync(`${__dirname}/../accounts.json`)) {
    return res.status(404).json({
      message: 'No accounts.'
    });
  }

  // Read the file
  let rawdata = fs.readFileSync(`${__dirname}/../accounts.json`);
  let accounts = JSON.parse(rawdata);

  if (accounts.length === 0) {
    return res.status(404).json({
      message: 'No accounts.'
    });
  }

  const _accounts = [];

  accounts.map(account => {
    const acc = {
      full_name: account.full_name,
      address: account.address
    }
    _accounts.push(acc);
  });

  res.status(200).json({
    resultCount: _accounts.length,
    data: _accounts,
    message: 'Success'
  });
}

exports.clean = (req, res) => {
  if (!fs.existsSync(`${__dirname}/../accounts.json`)) {
    return res.status(404).json({
      message: 'No file to clean.'
    });
  }

  // Write to a file
  try {
    fs.writeFileSync(`${__dirname}/../accounts.json`, JSON.stringify([]));
    console.log('Success in writing file');

    res.status(200).json({
      message: 'Cleanup successful'
    });
  } catch (err) {
    console.log('Error in writing file');
    console.log(err);

    res.status(400).json({
      message: 'Cleanup failed'
    });
  }
}
