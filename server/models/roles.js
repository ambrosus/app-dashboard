const mongoose = require('mongoose');

const rolesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    default: 1
  },
  createdAt: { type: Date, default: +new Date() },
  updatedAt: { type: Date, default: +new Date() }
});

rolesSchema.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

rolesSchema.pre('save', function(next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Roles', rolesSchema);
