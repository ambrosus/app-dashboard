const mongoose = require('mongoose');

const inviteSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  },
  to: {
    type: String,
    required: true
  },
  message: String,
  status: {
    type: String,
    enum : [1, 2, 3],
    default: 1
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

inviteSchema.pre('update', function(next) {
  this.updated = Date.now();
  next();
});

inviteSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Invite', inviteSchema);
