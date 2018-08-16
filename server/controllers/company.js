

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
