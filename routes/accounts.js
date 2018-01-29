// Used Components
const express = require('express');
const router = express.Router();
const esso = require('eve-sso-simple');

// Bring in User Models
const User = require('../models/user');
const Account = require('../models/account');
const Token = require('../models/token');

// Add Account
router.get('/add/:id', ensureAuthenticated, function(req, res) {
    httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
    res.render('account_add', {
        userid: req.params.id,
        user: req.user
    });
});

// Add Account
router.post('/add/:id', ensureAuthenticated, function(req, res) {  
    // get submitted values 
    const newAccount = new Account({
    userid : req.body.userid,
    character1 : req.body.character1,
    charactername1 : req.body.charactername1,
    usage1 : req.body.usage1,
    corp1 : req.body.corp1,
    corpname1 : req.body.corpname1,
    alliance1 : req.body.alliance1,
    alliancename1 : req.body.alliancename1,
    sec1 : req.body.sec1,
    birth1 : req.body.birth1,
    char1_pic : req.body.char1_pic,
    character2 : req.body.character2,
    charactername2 : req.body.charactername2,
    usage2 : req.body.usage2,
    corp2 : req.body.corp2,
    corpname2 : req.body.corpname2,
    alliance2 : req.body.alliance2,
    alliancename2 : req.body.alliancename2,
    sec2 : req.body.sec2,
    birth2 : req.body.birth2,
    char2_pic : req.body.char2_pic,
    character3 : req.body.character3,
    charactername3 : req.body.charactername3,
    usage3 : req.body.usage3,
    corp3 : req.body.corp3,
    corpname3 : req.body.corpname3,
    alliance3 : req.body.alliance3,
    alliancename3 : req.body.alliancename3,
    sec3 : req.body.sec3,
    birth3 : req.body.birth3,
    char3_pic : req.body.char3_pic,
    });    

    newAccount.save(function(err) {
        if (err) {
            dblog.error('Error saving Account during ADD: ' + newAccount.userid + ': ' + err);
            return;
        } else {
            req.flash('success', 'Account wurde hinzugefügt.');
            httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.redirect('/users/listall');
        }
    });
});

// Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Account.findById(req.params.id, function(err, account) {
        if (err) {
            dblog.error('Error finding account during account_edit: ' + err);
            return;
        } else {
            // User Check
            console.log(req.user.id);
            console.log(account.userid);
            if (req.user.id == account.userid || req.user.type == 'Admin') {   
                httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
                res.render('account_edit', {
                    accid: account._id,
                    userid: account.userid,
                    character1: account.character1,
                    charactername1: account.charactername1,
                    usage1: account.usage1,
                    character2: account.character2,
                    charactername2: account.charactername2,
                    usage2: account.usage2,
                    character3: account.character3,
                    charactername3: account.charactername3,
                    usage3: account.usage3,
                    user: req.user
                });
            } else {
                req.flash('danger', 'Nicht berechtigt !!');
                res.redirect('/users/listall');
            }
        }
    });
});

// Edit Form
router.post('/edit/:id', ensureAuthenticated, function(req, res) {  
    // get submitted values 
    const changedAccount = {
        userid : req.body.userid,
        character1 : req.body.character1,
        charactername1 : req.body.charactername1,
        usage1 : req.body.usage1,
        corp1 : req.body.corp1,
        corpname1 : req.body.corpname1,
        alliance1 : req.body.alliance1,
        alliancename1 : req.body.alliancename1,
        sec1 : req.body.sec1,
        birth1 : req.body.birth1,
        char1_pic : req.body.char1_pic,
        character2 : req.body.character2,
        charactername2 : req.body.charactername2,
        usage2 : req.body.usage2,
        corp2 : req.body.corp2,
        corpname2 : req.body.corpname2,
        alliance2 : req.body.alliance2,
        alliancename2 : req.body.alliancename2,
        sec2 : req.body.sec2,
        birth2 : req.body.birth2,
        char2_pic : req.body.char2_pic,
        character3 : req.body.character3,
        charactername3 : req.body.charactername3,
        usage3 : req.body.usage3,
        corp3 : req.body.corp3,
        corpname3 : req.body.corpname3,
        alliance3 : req.body.alliance3,
        alliancename3 : req.body.alliancename3,
        sec3 : req.body.sec3,
        birth3 : req.body.birth3,
        char3_pic : req.body.char3_pic
    };    

    let query = {
        _id: req.body.accid
    }

    Account.update(query, changedAccount, function(err) {
        if (err) {
            dblog.error('Error saving Account during EDIT: ' + changedAccount.userid + ': ' + err);
            return;
        } else {
            req.flash('success', 'Account "' + req.body.accid + '" wurde geändert.');
            httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.redirect('/users/listall');
        }
    });
});

// Delete Account
router.delete('/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id };

    Account.findById(req.params.id, function(err, account) {
        // User Check
        if (account.userid == req.user.id || req.user.type == 'Admin') {
            // Delete account from collection Accounts
            Account.remove(query, function(err) {
                if (err) {
                    dblog.error('Error deleting account during DELETE: ' + req.params.id + ': ' + err);
                    return;
                }
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('warning', 'Account "' + req.params.id + '" aus "accounts" wurde gelöscht');
                res.send('Success');
            });
        } else {
            res.status(500).send();
        }
    });
});

// EVE Online Auth
router.get('/auth', function(req, res){
    esso.login({
        client_id: '862888270db84fd5a30b0ba10b19e6a8',
        client_secret: 'D6fFDhV7G98fGG0ANYCXKAul7gPTKhc0NDuy3avm',
        redirect_uri: 'http://h2758397.stratoserver.net/accounts/callback',
        scope: 'publicData esi-planets.manage_planets.v1 esi-corporations.read_structures.v1 esi-characters.read_corporation_roles.v1 esi-assets.read_corporation_assets.v1 esi-bookmarks.read_corporation_bookmarks.v1 esi-corporations.read_starbases.v1 esi-industry.read_corporation_jobs.v1 esi-industry.read_corporation_mining.v1 esi-corporations.read_outposts.v1'
    }, res);
  });

// EVE Online SSO Callback
router.get('/callback', ensureAuthenticated, function(req, res) {
    
    // Returns a promise - resolves into a JSON object containing access and character token.
    var token = {};
    var char = {};
   
    esso.getTokens({
        client_id: '862888270db84fd5a30b0ba10b19e6a8',
        client_secret: 'D6fFDhV7G98fGG0ANYCXKAul7gPTKhc0NDuy3avm'
        }, req, res,
        function(accessToken, charToken){
            
            // Get Tokens and pass them to next Site
            token = accessToken;
            char = charToken;

            httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            
            var current = new Date();
            var tokenExpiration = new Date(current.getTime() + token.expires_in * 1000).toUTCString();
            
            res.render('callback', {
                accessToken : token.access_token,
                accessTokenExp : tokenExpiration,
                refreshToken : token.refresh_token,
                characterID : char.CharacterID,
                characterName : char.CharacterName,
                scopes : char.Scopes,
                user: req.user
            });
        }
    );
});

// EVE Online SSO Callback saveing
router.post('/callback', ensureAuthenticated, function(req, res) {  
    // get submitted values 
    const newToken = {
        charid : req.body.charid,
        charname : req.body.charname,
        scopes : req.body.scopes,
        accesstoken : req.body.access,
        accesstokenexp : req.body.access_exp,
        refreshtoken: req.body.refresh,
        refreshtokenexp : req.body.refresh_exp
    };    

    let query = {
        charid: req.body.charid
    }

    Token.update(query, newToken, {upsert:true}, function(err) {
        if (err) {
            dblog.error('Error saving Token during ADD: ' + req.body.charname + ': ' + err);
            return;
        } else {
            req.flash('success', 'Token für "' + req.body.charname + '" wurde gespeichert.');
            httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
            res.redirect('/overview/show');
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