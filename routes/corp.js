// Used Components
const express = require('express');
const router = express.Router();

// Bring in User Models
let Demand = require('../models/demand');

// Show Demand
router.get('/demand_show', ensureAuthenticated, function(req, res) {

    // Load demand and user information
    Demand.aggregate(
        { $lookup: { 
            from: 'users', 
            localField: 'create_userid', 
            foreignField: '_id', 
            as: 'create_userdata' } },
        { $lookup: { 
            from: 'users', 
            localField: 'process_userid', 
            foreignField: '_id', 
            as: 'process_userdata' } },
        { $project: { 
            _id: 1,
            type: 1, 
            items: 1,
            volume: 1, 
            start_sys: 1, 
            start_sta: 1, 
            target_sys: 1, 
            target_sta: 1, 
            create_date: 1, 
            create_user_name: { $ifNull : [ '$create_userdata.username', null ] },
            create_user_picture: { $ifNull : [ '$create_userdata.picture', null ] },
            process_date: 1, 
            process_user_name: { $ifNull : [ '$process_userdata.username', null ] },
            process_user_picture: { $ifNull : [ '$process_userdata.picture', null ] },
            comment: 1,
            status: 1
        } },
        { $unwind : { path: '$create_user_name', 'preserveNullAndEmptyArrays': true } },
        { $unwind : { path: '$process_user_nam', 'preserveNullAndEmptyArrays': true } },
        { $sort: { create_date: 1 } }
        //{ $match: { status: { $ne: 'FERTIG' } } }
        , function(err, demands) {
        if (err) {
            dblog.error('Error finding Chat Messages: ' + err);
            return;
        } else {
            httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.render('corp_demand_show', {
                demands: demands,
                user: req.user
            });
        }
    });
});

// Add Demand Request
router.get('/demand_add', ensureAuthenticated, function(req, res) {
    httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
    res.render('corp_demand_add', {
        user: req.user,
        add_type: req.query.type
    });
});

// Add Demand Request
router.post('/demand_add', ensureAuthenticated, function(req, res) {  

    //get items
    let items = [];
    for(var key in req.body) {
        if(/^product_/.test(key)){

            // get product first
            let product_key = key;                                      // product_1
            let product = req.body[key];                                // Hulk
            let list_id = product_key.substr(product_key.length -1 )    // 1

            // get corresponding volume, mount and typeID
            let amount = req.body['amount_'+list_id];
            let volume = req.body['volume_'+list_id];
            let typeID = req.body['typeID_'+list_id];

            // create items array of objects
            items.push({ 
                'amount' : amount,
                'product' : product,
                'volume' : volume,
                'typeID': typeID
            });
        }   
    }

    // get full demand and add items
    let newDemand = new Demand({
        type : req.body.type,
        items: items,    // <----items nested 
        volume: req.body.volume,
        start_sys: req.body.start_sys,
        start_sta: req.body.start_sta,
        target_sys: req.body.target_sys,
        target_sta: req.body.target_sta,
        create_date: new Date().toUTCString(),
        create_userid: req.user.id,
        process_date: null,
        process_userid: null,
        comment: req.body.comment,
        status: 'OFFEN'   
    });    

    // save Demand
    newDemand.save(function(err) {
        if (err) {
            dblog.error('Error saving Demand during ADD: ' + err);
            return;
        } else {
            req.flash('success', 'Bedarf wurde hinzugefügt.');
            httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.redirect('/corp/demand_show');
        }
    });
});

// Delete Demand
router.delete('/demand_delete/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id };

    Demand.findById(req.params.id, function(err, user) {
        // User Check
        if (user._id == req.user.id || req.user.type == 'Admin') {
            // Delete demand from collection Demands
            Demand.remove(query, function(err) {
                if (err) {
                    dblog.error('Error deleting demand during DELETE: ' + req.params.id + ': ' + err);
                    return;
                }
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('warning', 'Bedarf "' + req.params.id + '" aus "demands" wurde gelöscht');
                res.send('Success');
            });
        } else {
            res.status(500).send();
        }
    });
});

// Accept Demand
router.post('/demand_accept/:id/:type', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }
    let query = { _id: req.params.id };
    let update = {};

    // special status for 'Transport'
    if (req.params.type == 'Transport'){
        update = { $set: { status: 'LIEFERUNG', process_userid: req.user.id, process_date: new Date() } };
    } else {
        update = { $set: { status: 'IN ARBEIT', process_userid: req.user.id, process_date: new Date() } };
    }

    // Update Demand
    Demand.update(query, update, function(err) {
        if (err) {
            dblog.error('Error saving Demand Status during demand accept: ' + err);
            return;
        } 
        httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
        req.flash('success', 'Auftrag wurde angenommen.');
        res.send('Success');
    });
});

// Decline Demand
router.post('/demand_decline/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }
    let query = { _id: req.params.id };
    let update = { $set: { status: 'OFFEN', process_userid: null, process_date: null } };

    // User Check
    Demand.findById(req.params.id, function(err, demand_item) {
        // Check if user is owner or admin
        if (req.user.id == demand_item.process_userid || req.user.type == 'Admin') {
            // Update Demand
            Demand.update(query, update, function(err) {
                if (err) {
                    dblog.error('Error saving Demand Status during demand decline: ' + err);
                    return;
                } 
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('success', 'Auftrag wurde abgelehnt.');
                res.send('Success');
            });
        } else {
            res.status(500).send();
        }
    });
});

// Finsih Demand
router.post('/demand_finish/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }
    let query = { _id: req.params.id };
    let update = { $set: { status: 'FERTIG' } };

    // User Check
    Demand.findById(req.params.id, function(err, demand_item) {
        // Check if user is owner or admin
        if (req.user.id == demand_item.process_userid || req.user.type == 'Admin') {
            // Update Demand
            Demand.update(query, update, function(err) {
                if (err) {
                    dblog.error('Error saving Demand Status during demand finish: ' + err);
                    return;
                } 
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('success', 'Auftrag wurde fertiggestellt.');
                res.send('Success');
            });
        } else {
            res.status(500).send();
        }
    });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Bitte erneut einloggen');
        res.redirect('/users/login');
    }
}

module.exports = router;