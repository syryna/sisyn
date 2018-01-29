const mongoose = require('mongoose');

// News Schema
const newsSchema = mongoose.Schema({
    userid: {
        type: 'objectId',
        required: true
    },
    bgurl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    news: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
});

let News = module.exports = mongoose.model('new', newsSchema);