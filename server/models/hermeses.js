const mongoose = require('mongoose');

const hermesesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  public: {
    type: Boolean,
    default: true
  },
  createdAt: { type: Date, default: +new Date() },
  updatedAt: { type: Date, default: +new Date() }
});

hermesesSchema.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

hermesesSchema.pre('save', function(next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Hermeses', hermesesSchema);
