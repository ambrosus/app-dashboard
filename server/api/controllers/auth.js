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

function getAccounts() {
  let accounts;

  try {
    accounts = JSON.parse(fs.readFileSync(`${__dirname}/../accounts.json`));
  } catch (err) {
    accounts = [];
  }

  return accounts;
}

function saveAccounts(accounts) {
  if (accounts) {
    fs.writeFileSync(`${__dirname}/../accounts.json`, JSON.stringify(accounts));
    return true;
  }
  return false;
}

function accountExists(emailOrAddress) {
  const accounts = getAccounts();
  const user = accounts.filter(account => account.email === emailOrAddress || account.address === emailOrAddress);
  return user[0];
}

exports.resetpassword = (req, res) => {
  const email = req.body.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.password;

  const account = accountExists(email);

  if (email && oldPassword && newPassword && account) {
    const [address, secret] = decrypt(account.token, oldPassword).split('|||');

    if (address && secret) {
      // Resign with newPassword
      account.token = encrypt(`${address}|||${secret}`, newPassword);

      let accounts = getAccounts();
      accounts = accounts.map(a => (a.email === email ? account : a));

      if (saveAccounts(accounts)) {
        res.status(200).json({ message: 'Reset password succesfull.' });
      } else {
        res.status(400).json({ message: 'Reset password failed.' });
      }
    } else {
      return res.status(401).json({ message: 'Password is incorrect.' });
    }
  } else if (!email) {
    return res.status(401).json({ message: 'E-mail is missing.' });
  } else if (!oldPassword) {
    return res.status(401).json({ message: 'Old password is missing.' });
  } else if (!newPassword) {
    return res.status(401).json({ message: 'Password is missing' });
  } else {
    return res.status(401).json({ message: 'E-mail does not exists.' });
  }
};

exports.login = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const account = accountExists(email);

  if (email && password && account) {
    const [address, secret] = decrypt(account.token, password).split('|||');

    if (address && secret) {
      res.status(200).json({
        address,
        secret
      });
    } else {
      return res.status(401).json({
        message: 'Password is incorrect.'
      });
    }
  } else if (!email) {
    return res.status(401).json({ message: 'E-mail is missing.' });
  } else if (!password) {
    return res.status(401).json({ message: 'Password is missing' });
  } else {
    return res.status(401).json({ message: 'E-mail does not exists.' });
  }
};

exports.signup = (req, res) => {
  const address = req.body.address;
  const secret = req.body.secret;
  const full_name = req.body.full_name;
  const company = req.body.company;
  const email = req.body.email;
  const password = req.body.password;

  const account = accountExists(email) || accountExists(address);

  if (address && secret && email && password && !account) {
    let accounts = getAccounts();

    accounts.push({
      token: encrypt(`${address}|||${secret}`, password),
      full_name,
      company,
      email,
      address
    });

    if (saveAccounts(accountExists)) {
      res.status(200).json({ message: 'Signup successful' });
    }

  } else if (!address) {
    return res.status(401).json({ message: 'Address is missing.' });
  } else if (!secret) {
    return res.status(401).json({ message: 'Secret is missing.' });
  } else if (!email) {
    return res.status(401).json({ message: 'E-mail is missing.' });
  } else if (!password) {
    return res.status(401).json({ message: 'Password is missing.' });
  }else{
    return res.status(401).json({ message: 'Account already exists.' });
  }
};
