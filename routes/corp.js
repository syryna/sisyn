// Used Components
const express = require('express');
const router = express.Router();

// Bring in User Models
//const User = require('../models/user');

// Add Account
router.get('/demand', ensureAuthenticated, function(req, res) {
    httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
    res.render('corp_demand', {
        user: req.user
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