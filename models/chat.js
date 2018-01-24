const mongoose = require('mongoose');

// User Schema
const chatSchema = mongoose.Schema({
    userid: {
        type: 'objectId',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
});

let Chat = module.exports = mongoose.model('chat', chatSchema);