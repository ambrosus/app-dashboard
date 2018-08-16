const mongoose = require('mongoose');

const companySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  hermes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hermes'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  },
  public: {
    type: Boolean,
    default: true
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
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

companySchema.pre('update', function(next) {
  this.updated = Date.now();
  next();
});

companySchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Company', companySchema);
