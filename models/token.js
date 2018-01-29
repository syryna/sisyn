const mongoose = require('mongoose');

// Token Schema
const tokenSchema = mongoose.Schema({
    charid: {
        type: String,
        required: true
    },
    charname: {
        type: String,
        required: true
    },
    scopes: {
        type: String,
        required: true
    },
    accesstoken: {
        type: String,
        required: true
    },
    accesstokenexp: {
        type: Date,
        required: true
    },
    refreshtoken: {
        type: String,
        required: true
    },
    corp_role: {
        type: String,
        required: true
    }
});

let Token = module.exports = mongoose.model('token', tokenSchema);