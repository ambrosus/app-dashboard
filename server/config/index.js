let magic;
try {
  magic = require('./magic');
} catch (e) {}

module.exports = {
  db: magic ? magic.MONGODB_URI : process.env.MONGODB_URI,
  port: process.env.PORT || 5000,
  email: {
    API_KEY: magic ? magic.EMAIL_API_KEY : process.env.EMAIL_API_KEY,
  }
};
