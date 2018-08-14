let magic;
try {
  magic = require('./magic');
} catch (e) {}

module.exports = {
  db: magic ? magic.MONGODB_URI : process.env.MONGODB_URI,
  email: {
    API_KEY: magic ? magic.EMAIL_API : process.env.EMAIL_API,
  }
};
