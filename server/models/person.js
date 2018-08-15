const mongoose = require('mongoose');

const personSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  accounts: [
    {
      address: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      },
      hermes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hermes'
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
      },
      role: {
        type: String,
        enum: [1, 2, 3, 4, 5],
        default: 4
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
      }
    }
  ],
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

personSchema.pre('update', function(next) {
  this.updated = Date.now();
  next();
});

personSchema.pre('save', function(next) {
  this.updated = Date.now();
  next();
});

module.exports = mongoose.model('Person', personSchema);
