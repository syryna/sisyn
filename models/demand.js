const mongoose = require('mongoose');

// Token Schema
const demandSchema = mongoose.Schema({
    type: {
        type: String
    },
    items: [{
        amount: {
            type: Number
        },
        product: {
            type: String
        },
        volume: {
            type: Number
        },
        typeID: {
            type: Number
        }
    }],
    volume: {
        type: Number
    },
    start_sys: {
        type: String
    },
    start_sta: {
        type: String
    },
    target_sys: {
        type: String
    },
    target_sta: {
        type: String
    },
    comment: {
        type: String
    },
    create_date: {
        type: Date
    },
    create_userid: {
        type: 'objectId'
    },
    process_date: {
        type: Date
    },
    process_userid: {
        type: 'objectId'
    },
    status: {
        type: String
    }
});

let Demand = module.exports = mongoose.model('demand', demandSchema);