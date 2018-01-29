// Used Components
const express = require('express');
const multer = require('multer');
const router = express.Router();

// Initialize Multer Middleware
var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/img/news');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
  });
var upload = multer({ storage : storage}).single('fileinput');

// Bring in User Models
const Chat = require('../models/chat');
const News = require('../models/news');
const User = require('../models/user');

// Show Overview
router.get('/show', ensureAuthenticated, function(req, res) {
    
    //Load News
    News.find({}, function(err, news) {
        if (err) {
            dblog.error('Error finding news during SHOW OVERVIEW: ' + err);
        } else {
            // Load all users
            User.find({}, function(err, users) {
                if (err) {
                    dblog.error('Error finding users during SHOW OVERVIEW: ' + err);
                } else {
                    httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
                    res.render('overview_show', {
                        news: news,
                        users: users,
                        user: req.user
                    });
                }
            });

        }
    });
});

// Delete Chat
router.delete('/chat/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id };

    Chat.findById(req.params.id, function(err, chat) {
        // User Check
        if (chat.userid == req.user.id || req.user.type == 'Admin') {
            // Delete account from collection Accounts
            Chat.remove(query, function(err) {
                if (err) {
                    dblog.error('Error deleting chat during DELETE: ' + req.params.id + ': ' + err);
                    return;
                }
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('warning', 'Chat "' + req.params.id + '" aus "chats" wurde gelöscht');
                res.send('Success');
            });
        } else {
            res.status(500).send();
        }
    });
});

// Add News
router.get('/newsadd', ensureAuthenticated, function(req, res) {
    httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
    res.render('overview_newsadd', {
        user: req.user
    });
});

// Add News

router.post('/newsadd', ensureAuthenticated, function(req, res) {
    //Multer File Upload logic
    upload(req,res,function(err) {
        if(err) {
            req.flash('danger', 'Fehler beim Hochladen des Bildes');
            return;
        } 

        // get submitted picture path and name or replace by null
        var destination = typeof req.file !== "undefined" ? req.file.destination.substr(8) + '/' : null; //cuts ./public from full path and adds a / at the end
        var filename = typeof req.file !== "undefined" ? req.file.filename : null;
        var bgurl = destination + filename; 

        //save News
        let newNews = new News({
            userid: req.user._id,
            bgurl:  bgurl ,
            title: req.body.title,
            news: req.body.news,
            timestamp: new Date().toUTCString()
        });
        
        // Validation
        req.checkBody('title', 'Bachrichtentitel wird benötigt').notEmpty();
        req.checkBody('news', 'Nachrichtentext wird benötigt').notEmpty();

        let errors = [];
        errors = errors.concat(req.validationErrors());

        // image validation
        if (typeof req.file === "undefined"){
            errors.push({"param":"fileinput","msg":"Bild nicht ausgewählt","value":""});   
        }

        // Validation Errors
        if (errors[0]) {
            res.render('overview_newsadd', {
                form_errors: errors,
                title: req.body.title,
                news: req.body.news,
                user: req.user
            });
            httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);

            // Validation Success
        } else {
            newNews.save(function(err) {
                if (err) {
                    dblog.error('Error saving News during ADD: ' + req.user.username + ': ' + err);
                    return;
                } else {
                    req.flash('success', 'Nachricht "' + req.body.title + '" wurde angelegt.');
                    httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body) + ' File: ' +JSON.stringify(req.file));
                    res.redirect('/overview/show');
                }
            });
        }
    });
});

// Delete News
router.delete('/news/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id };

    News.findById(req.params.id, function(err, news) {
        // User Check
        if (news.userid == req.user.id || req.user.type == 'Admin') {
            // Delete news from collection News
            News.remove(query, function(err) {
                if (err) {
                    dblog.error('Error deleting news during DELETE: ' + req.params.id + ': ' + err);
                    return;
                }
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('warning', 'Nachricht "' + req.params.id + '" aus "news" wurde gelöscht');
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