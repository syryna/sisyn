// Used Components
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Recaptcha = require('express-recaptcha');
const passport = require('passport');

// Google reCaptcha Initialization
const recaptcha = new Recaptcha('6LdSUzoUAAAAALreqWmgqJX0IIWYwQ5m0X6DZ8S5', '6LdSUzoUAAAAAGQuTEnEnAD-AoYmyenMOOYJ9VWC');

// Bring in User Models
const User = require('../models/user');

// Register Form
router.get('/register', recaptcha.middleware.render, function(req, res) {
    httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
    res.render('register', {
        layout: false,
        captcha: res.recaptcha
    });
});

// Register Process
router.post('/register', recaptcha.middleware.verify, function(req, res) {

    // get submitted values 
    const username = req.body.username;
    const firstname = req.body.firstname;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    // Validation
    req.checkBody('username', 'Benutzer wird benötigt').notEmpty();
    req.checkBody('firstname', 'Vorname wird benötigt').notEmpty();
    req.checkBody('email', 'E-Mail wird benötigt').notEmpty();
    req.checkBody('email', 'E-Mail nicht gültig').isEmail();
    req.checkBody('password', 'Passwort wird benötigt').notEmpty();
    req.checkBody('password2', 'Passwort wird benötigt').notEmpty();
    req.checkBody('password2', 'Passwort stimmt nicht überein').equals(req.body.password);

    let errors = [];
    errors = errors.concat(req.validationErrors());

    let queryforUsername = {};
    queryforUsername["username"] = username;

    User.find(queryforUsername, function(error, item) {
        if (error) {
            dblog.error('Error finding User during REGISTER: ' + error);
            return;
        }
        // check for user duplicate
        if (item.length > 0) {
            let new_error = {
                'param': 'username',
                'msg': 'Benutzer "' + username + '" bereits vergeben',
                'value': ''
            };
            errors.push(new_error);
        }

        // Validation Errors
        if (errors[0] || req.recaptcha.error) {
            res.render('register', {
                form_errors: errors,
                recaptchaerror: req.recaptcha.error,
                layout: false,
                username: username,
                firstname: firstname,
                email: email
            });
            httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);

            // Validation Success
        } else {
            const newUser = new User({
                username: username,
                firstname: firstname,
                age: '',
                email: email,
                password: password,
                picture: '/img/avatars/1_32.jpg',
                locked: true,
                type: 'Standard',
                regdate: new Date().toUTCString(),
                logindate: ''
            });

            // Password Encryption
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(newUser.password, salt, function(err, hash) {
                    if (err) {
                        applog.error('Password encryption failed: ' + err);
                    }
                    newUser.password = hash;
                    newUser.save(function(err) {
                        if (err) {
                            dblog.error('Error saving user during REGISTER: ' + newUser.username + ': ' + err);
                            return;
                        } else {
                            req.flash('success', 'Benutzer wurde angelegt. Der Administrator muss dich noch freischalten');
                            httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
                            res.redirect('/users/login');
                        }
                    });
                });
            });

        }
    })
});

// Login Form
router.get('/login', function(req, res) {
    httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
    res.render('login', {
        layout: false
    });
});

// Login Process
router.post('/login', function(req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/overview/show',
        failureRedirect: '/users/login',
        failureFlash: true,
        badRequestMessage: 'Kein Benutzerkonto oder Passwort eingegeben'
    })(req, res, next);
    httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
});

// Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) {
            dblog.error('Error finding user during user_edit: ' + err);
            return;
        } else {
            // User Check
            if (user._id == req.user.id || req.user.type == 'Admin') {
                httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
                res.render('user_edit', {
                    _id: user._id,
                    username: user.username,
                    firstname: user.firstname,
                    age: user.age,
                    email: user.email,
                    picture: user.picture,
                    user: user
                });
            } else {
                req.flash('danger', 'Nicht berechtigt !!');
                res.redirect('/');
            }
        }
    });
});

// Edit Process
router.post('/edit/:id', ensureAuthenticated, function(req, res) {
    let user = {};
    // get submitted values 
    user._id = req.body.id;
    user.username = req.body.username;
    user.firstname = req.body.firstname;
    user.age = req.body.age;
    user.email = req.body.email;
    user.picture = req.body.picture;
    user.password = req.body.password;
    user.password2 = req.body.password2;

    // Validation
    req.checkBody('username', 'Benutzer wird benötigt').notEmpty();
    req.checkBody('firstname', 'Vorname wird benötigt').notEmpty();
    req.checkBody('age', 'Alter zwischen 1 und 99 erlaubt').isInt({
        min: 1,
        max: 99
    });
    req.checkBody('email', 'E-Mail wird benötigt').notEmpty();
    req.checkBody('email', 'E-Mail nicht gültig').isEmail();
    req.checkBody('picture', 'Bild Url wird benötigt').notEmpty();
    req.checkBody('password', 'Passwort wird benötigt').notEmpty();
    req.checkBody('password2', 'Passwort wird benötigt').notEmpty();
    req.checkBody('password2', 'Passwort stimmt nicht überein').equals(req.body.password);

    let errors = [];
    errors = errors.concat(req.validationErrors());

    // Validation Errors
    if (errors[0]) {
        res.render('user_edit', {
            form_errors: errors,
            _id: user._id,
            username: user.username,
            firstname: user.firstname,
            age: user.age,
            email: user.email,
            picture: user.picture,
            user: user
        });
        httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);

        // Validation Success
    } else {
        // Password Encryption
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    applog.error('Password encryption failed: ' + err);
                }
                user.password = hash;

                let query = {
                    _id: req.params.id
                }

                // Update User
                User.update(query, user, function(err) {
                    if (err) {
                        dblog.error('Error saving user during user_edit: ' + user.username + ': ' + err);
                        return;
                    } else {
                        req.flash('success', user.username + ', dein Profil wurde geändert');
                        httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
                        res.redirect('/');
                    }
                });
            });
        });

    }
});

// Delete User
router.delete('/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id };

    User.findById(req.params.id, function(err, user) {
        // User Check
        if (user._id == req.user.id || req.user.type == 'Admin') {
            User.remove(query, function(err) {
                if (err) {
                    dblog.error('Error deleting user during DELETE: ' + params.id + ': ' + err);
                    return;
                }
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('success', 'Benutzer "' + user.username + '" wurde gelöscht');
                res.send('Success');
            });
        } else {
            res.status(500).send();
        }
    });
});

// Lock User
router.post('/lock/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }
    let query = { _id: req.params.id };

    User.findById(req.params.id, function(err, user) {
        // User Check
        if (req.user.type == 'Admin') {
            user.locked = true;
            User.update(query, user, function(err) {
                if (err) {
                    dblog.error('Error updating user during LOCK: ' + params.id + ': ' + err);
                    return;
                }
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('success', 'Benutzer "' + user.username + '" wurde gesperrt');
                res.send('Success');
            });
        } else {
            res.status(500).send();
        }
    });
});

// Unlock User
router.post('/unlock/:id', function(req, res) {
    if (!req.user.id) {
        res.status(500).send();
    }
    let query = { _id: req.params.id };

    User.findById(req.params.id, function(err, user) {
        // User Check
        if (req.user.type == 'Admin') {
            user.locked = false;
            User.update(query, user, function(err) {
                if (err) {
                    dblog.error('Error updating user during UNLOCK: ' + params.id + ': ' + err);
                    return;
                }
                httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl + ' Body: ' + JSON.stringify(req.body));
                req.flash('success', 'Benutzer "' + user.username + '" wurde freigeschaltet');
                res.send('Success');
            });
        } else {
            res.status(500).send();
        }
    });
});

// Logout
router.get('/logout', ensureAuthenticated, function(req, res) {
    req.flash('success', res.locals.user.username + ', du bist ausgeloggt');
    httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
    req.logout();
    res.redirect('/users/login');
});

// List all members
router.get('/userlist', ensureAuthenticated, function(req, res) {
    User.find({}, function(err, users) {
        if (err) {
            dblog.error('Error finding user during USERLIST: ' + err);
        } else {
            httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);
            res.render('userlist', {
                users: users,
                current_user_id: req.user.id,
                current_user_type: req.user.type
            });
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