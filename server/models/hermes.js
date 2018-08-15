const mongoose = require('mongoose');

const hermesSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum : ['dev', 'test', 'prod'],
    required: true
  },
  public: {
    type: Boolean,
    required: true
  },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

hermesSchema.pre('update', function(next) {
  this.updated = Date.now();
  next();
});

hermesSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Hermes', hermesSchema);
