// Used Components
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Bring in User Models
var invtypes = mongoose.model('invtype', new mongoose.Schema(), 'invtypes'); // no Schema
var mapsolarsystems = mongoose.model('mapsolarsystem', new mongoose.Schema(), 'mapsolarsystems'); // no Schema

// find invTypes by TypeName
router.get('/invtypes/:name', ensureAuthenticated, function(req, res) {

    let param = req.params.name;

    // Convert Search String from 'buzz' or 'BuzZ' to LIKE '%buzz%'
    //let query = { "typeName": { '$regex': new RegExp(param, "i") }, "published": 1}; // https://stackoverflow.com/questions/33455979/use-variable-with-regex-to-find-data-in-mongodb-meteor-app
    let query = { "typeName": param, "published": 1};

    invtypes.find(query).lean().exec(function(err, result) {
        if (err) {
            dblog.error('Error finding invTypes during inTypes READ: ' + err);
        } else {
            httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        }
    }); 
});

// find invtypes ALL and just give object of array with typeName : typeID out
router.get('/invtypesall', ensureAuthenticated, function(req, res) {

    invtypes.find({"published": 1}).lean().exec(function(err, result) {
        if (err) {
            dblog.error('Error finding invTypes during inTypes READ: ' + err);
        } else {
            httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.setHeader('Content-Type', 'application/json');

            // build array of objects
            let invtype = [];
            for (i in result){
                invtype.push({
                    [result[i].typeName] : result[i].typeID
                });
            }
            // sort by invtype - https://stackoverflow.com/questions/20083324/sorting-an-array-of-objects-by-keyname-in-javascript
            invtype.sort(function(a,b){
                return (Object.keys(a)[0] > Object.keys(b)[0]) - 0.5;
            });

            res.send(JSON.stringify(invtype));
        }
    }); 
});

// find mapsolarsystems by solarSystemName
router.get('/mapsolarsystems/:name', ensureAuthenticated, function(req, res) {

    let param = req.params.name;
    let query = { 'solarSystemName': param };

    mapsolarsystems.find(query).lean().exec(function(err, result) {
        if (err) {
            dblog.error('Error finding invTypes during mapsolarsystems READ: ' + err);
        } else {
            httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        }
    }); 
});


// find mapsolarsystems ALL and just give object of array with solarSystemName : solarSystemID out
router.get('/mapsolarsystemsall', ensureAuthenticated, function(req, res) {

    mapsolarsystems.find({}).lean().exec(function(err, result) {
        if (err) {
            dblog.error('Error finding invTypes during mapsolarsystems READ: ' + err);
        } else {
            httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.setHeader('Content-Type', 'application/json');

            // build array of objects
            let solarsystem = [];
            for (i in result){
                solarsystem.push({
                    [result[i].solarSystemName] : result[i].solarSystemID
                });
            }
            // sort by solarsystemname - https://stackoverflow.com/questions/20083324/sorting-an-array-of-objects-by-keyname-in-javascript
            solarsystem.sort(function(a,b){
                return (Object.keys(a)[0] > Object.keys(b)[0]) - 0.5;
            });

            res.send(JSON.stringify(solarsystem));
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