// Used Components
const express = require('express');
const router = express.Router();
const esso = require('eve-sso-simple');

// Add Account
router.get('/add/:id', ensureAuthenticated, function(req, res) {
    httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
    res.render('add_account');
});

// EVE Online Auth
router.get('/auth', function(req, res){
    esso.login({
        client_id: '862888270db84fd5a30b0ba10b19e6a8',
        client_secret: 'D6fFDhV7G98fGG0ANYCXKAul7gPTKhc0NDuy3avm',
        redirect_uri: 'http://localhost:3001/account/callback',
        scope: 'esi-assets.read_assets.v1'
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
                scopes : char.Scopes
            });

        }
    );

    
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