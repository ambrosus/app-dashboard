/*
Copyright: Ambrosus Technologies GmbH
Email: tech@ambrosus.com
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
This Source Code Form is “Incompatible With Secondary Licenses”, as defined by the Mozilla Public License, v. 2.0.
*/
const mongoose = require('mongoose');
const usersSchema = mongoose.Schema(
{
    _id: mongoose.Schema.Types.ObjectId,
    full_name:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true
    },
    company:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Companies'
    },
    address:
    {
        type: String,
        required: true
    },
    token:
    {
        type: String,
        required: true
    },
    role:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roles'
    },
    profile_image: String,
    active:
    {
        type: Boolean,
        default: true
    },
    settings: String,
    createdAt:
    {
        type: Date,
        default: +new Date()
    },
    updatedAt:
    {
        type: Date,
        default: +new Date()
    }
});
usersSchema.pre('update', function(next)
{
    this.updatedAt = +new Date();
    next();
});
usersSchema.pre('save', function(next)
{
    this.updatedAt = +new Date();
    next();
});
module.exports = mongoose.model('Users', usersSchema);
