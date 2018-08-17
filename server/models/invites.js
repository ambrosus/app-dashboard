const mongoose = require('mongoose');

const invitesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  to: {
    type: String,
    required: true
  },
  message: String,
  validUntil: {
    type: Date,
    default: +new Date() + 2*24*60*60*1000
  },
  token: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companies'
  },
  createdAt: { type: Date, default: +new Date() },
  updatedAt: { type: Date, default: +new Date() }
});

invitesSchema.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

invitesSchema.pre('save', function(next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Invites', invitesSchema);
