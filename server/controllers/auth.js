const fs = require('fs');
const crypto = require('crypto');
const notifications = require('./notifications')

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

  if (!fs.existsSync(`${__dirname}/../accounts.json`)) {
    fs.writeFile(`${__dirname}/../accounts.json`, JSON.stringify([]));
  }

  try {
    accounts = JSON.parse(fs.readFileSync(`${__dirname}/../accounts.json`));
  } catch (err) {
    accounts = [];
  }

  return accounts;
}

function saveAccounts(accounts) {
  if (accounts) {
    try {
      fs.writeFileSync(`${__dirname}/../accounts.json`, JSON.stringify(accounts));
      return true;
    } catch (err) {
      return false;
    }
  }
  return false;
}

function accountExists(emailOrAddress) {
  const accounts = getAccounts();
  const user = accounts.find(account => account.email === emailOrAddress || account.address === emailOrAddress);
  return user;
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
        res.status(200).json({
          message: 'Reset password succesfull.'
        });
      } else {
        res.status(400).json({
          message: 'Reset password failed.'
        });
      }
    } else {
      return res.status(401).json({
        message: 'Password is incorrect.'
      });
    }
  } else if (!email) {
    return res.status(401).json({
      message: 'E-mail is missing.'
    });
  } else if (!oldPassword) {
    return res.status(401).json({
      message: 'Old password is missing.'
    });
  } else if (!newPassword) {
    return res.status(401).json({
      message: 'Password is missing'
    });
  } else {
    return res.status(401).json({
      message: 'Account does not exists.'
    });
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
    return res.status(401).json({
      message: 'E-mail is missing.'
    });
  } else if (!password) {
    return res.status(401).json({
      message: 'Password is missing'
    });
  } else {
    return res.status(401).json({
      message: 'Account does not exists.'
    });
  }
};

exports.signup = (req, res) => {
  const address = req.body.address;
  const secret = req.body.secret;
  const full_name = req.body.full_name;
  const company = req.body.company;
  const email = req.body.email;
  const password = req.body.password;

  const role = 'owner';

  const account = accountExists(email) || accountExists(address);

  if (address && secret && email && password && !account) {
    let accounts = getAccounts();

    accounts.push({
      token: encrypt(`${address}|||${secret}`, password),
      full_name,
      company,
      email,
      address,
      role,
      settings: {
        notifications: {
          asset: {
            create: true,
            edit: true
          },
          event: {
            create: true,
            edit: true
          }
        }
      }
    });

    if (saveAccounts(accounts)) {
      res.status(200).json({
        message: 'Signup successful'
      });
    }

  } else if (!address) {
    return res.status(401).json({
      message: 'Address is missing.'
    });
  } else if (!secret) {
    return res.status(401).json({
      message: 'Secret is missing.'
    });
  } else if (!email) {
    return res.status(401).json({
      message: 'E-mail is missing.'
    });
  } else if (!password) {
    return res.status(401).json({
      message: 'Password is missing.'
    });
  } else {
    return res.status(401).json({
      message: 'Account already exists.'
    });
  }
};

exports.accounts = (req, res) => {
  const accounts = getAccounts();

  if (accounts.length > 0) {
    const _accounts = [];

    accounts.map(account => {
      _accounts.push({
        full_name: account.full_name,
        address: account.address
      });
    });

    res.status(200).json({
      resultCount: _accounts.length,
      data: _accounts,
      message: 'Success'
    });
  } else {
    return res.status(404).json({
      message: 'No accounts'
    });
  }
}

exports.account = (req, res) => {
  const address = req.params.address;
  const accounts = getAccounts();

  if (accounts.length > 0) {
    const account = accounts.find((acc) => acc.address === address);

    if (account) {
      res.status(200).json({
        account,
        accounts,
        notifications: notifications.getNewestNotifications(address)
      });
    } else {
      return res.status(404).json({message: 'No account'});
    }
  } else {
    return res.status(404).json({message: 'No accounts'});
  }
}

exports.edit = (req, res) => {
  const address = req.params.address;
  const settings = req.body.settings;
  const accounts = getAccounts();
  let updateOptions = {};
  Object.keys(req.body).map((opt) => {
    updateOptions[opt] = req.body[opt];
  });
  updateOptions = Object.entries(updateOptions)
    .filter((opt) => opt[0] === 'full_name' || opt[0] === 'email' || opt[0] === 'company');

  accounts.map((account) => {
    if (account.address === address) {
      updateOptions.map((opt) => {
        account[opt[0]] = opt[1];
      });
      // notifications
      account.settings.notifications.asset.create = settings.notifications.indexOf((n) => n === 'assetCreate') > -1 ? true : false;
      account.settings.notifications.asset.edit = settings.notifications.indexOf((n) => n === 'assetEdit') > -1 ? true : false;
      account.settings.notifications.event.create = settings.notifications.indexOf((n) => n === 'eventCreate') > -1 ? true : false;
      account.settings.notifications.event.edit = settings.notifications.indexOf((n) => n === 'eventEdit') > -1 ? true : false;
    }
  });

  if (saveAccounts(accounts)) {
    res.status(200).json({ message: 'Edit successful' });
  } else {
    res.status(200).json({ message: 'Edit failed' });
  }
}

exports.clean = (req, res) => {
  const accounts = getAccounts();

  if (accounts.length > 0) {
    if (saveAccounts([])) {
      return res.status(200).json({
        message: 'Cleanup successful'
      });
    } else {
      return res.status(400).json({
        message: 'Cleanup failed'
      });
    }
  } else {
    return res.status(404).json({
      message: 'No accounts'
    });
  }
}
