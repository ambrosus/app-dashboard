const mongoose = require('mongoose');

const notificationsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  message: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  seen: {
    type: Boolean,
    required: false
  },
  createdAt: { type: Date, default: +new Date() },
  updatedAt: { type: Date, default: +new Date() }
});

notificationsSchema.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

notificationsSchema.pre('save', function(next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Notifications', notificationsSchema);
