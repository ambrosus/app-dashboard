const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  content: {
    type: String,
    required: true
  },
  person: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person'
  },
  seen: {
    type: Boolean,
    required: false
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

notificationSchema.pre('update', function(next) {
  this.updated = Date.now();
  next();
});

notificationSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
