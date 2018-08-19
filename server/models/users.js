const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companies'
  },
  address: {
    type: String,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roles'
  },
  active: {
    type: Boolean,
    default: true
  },
  settings: {
    developer: {
      type: Boolean,
      default: false
    },
    notifications: {
      asset: {
        create: {
          type: Boolean,
          default: true
        },
        edit: {
          type: Boolean,
          default: true
        }
      },
      event: {
        create: {
          type: Boolean,
          default: true
        },
        edit: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  createdAt: { type: Date, default: +new Date() },
  updatedAt: { type: Date, default: +new Date() }
});

usersSchema.pre('update', function(next) {
  this.updatedAt = +new Date();
  next();
});

usersSchema.pre('save', function(next) {
  this.updatedAt = +new Date();
  next();
});

module.exports = mongoose.model('Users', usersSchema);
