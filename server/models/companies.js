const mongoose = require('mongoose');

const companiesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  hermes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hermeses'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  active: {
    type: Boolean,
    default: true
  },
  branding: {
    dasboard: String,
    ambto: String
  },
  settings: {
    preview_app: {
      type: String,
      default: 'https://amb.to'
    },
    logo: String
  },
  createdAt: { type: Date, default: +new Date() },
  updatedAt: { type: Date, default: +new Date() }
});

companiesSchema.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

companiesSchema.pre('save', function(next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Companies', companiesSchema);
