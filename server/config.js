module.exports = {
  db: process.env.MONGODB_URI,
  port: process.env.PORT || 5000,
  email: {
    API_KEY: process.env.EMAIL_API_KEY,
  }
};
