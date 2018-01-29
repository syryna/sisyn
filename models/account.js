const mongoose = require('mongoose');

// Account Schema
const accountSchema = mongoose.Schema({
    userid: {
        type: 'objectId',
        required: true
    },
    character1: {
        type: String
    },
    charactername1: {
        type: String
    },
    usage1: {
        type: String
    },
    corp1: {
        type: String
    },
    corpname1: {
        type: String
    },
    alliance1: {
        type: String
    },
    alliancename1: {
        type: String
    },
    sec1: {
        type: String
    },
    birth1: {
        type: Date
    },
    char1_pic: {
        type: String
    },
    character2: {
        type: String
    },
    charactername2: {
        type: String
    },
    usage2: {
        type: String
    },
    corp2: {
        type: String
    },
    corpname2: {
        type: String
    },
    alliance2: {
        type: String
    },
    alliancename2: {
        type: String
    },
    sec2: {
        type: String
    },
    birth2: {
        type: Date
    },
    char2_pic: {
        type: String
    },
    character3: {
        type: String
    },
    charactername3: {
        type: String
    },
    usage3: {
        type: String
    },
    corp3: {
        type: String
    },
    corpname3: {
        type: String
    },
    alliance3: {
        type: String
    },
    alliancename3: {
        type: String
    },
    sec3: {
        type: String
    },
    birth3: {
        type: Date
    },
    char3_pic: {
        type: String
    },
});

let Account = module.exports = mongoose.model('account', accountSchema);