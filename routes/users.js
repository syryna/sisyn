// Used Components
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Recaptcha = require('express-recaptcha');
const passport = require('passport');

// Google reCaptcha Initialization
var recaptcha = new Recaptcha('6LdSUzoUAAAAALreqWmgqJX0IIWYwQ5m0X6DZ8S5', '6LdSUzoUAAAAAGQuTEnEnAD-AoYmyenMOOYJ9VWC');

// Bring in User Models
let User = require('../models/user');

// Authentication Module
//let shared = require('../shared.js');

// Register Form
router.get('/register', recaptcha.middleware.render, function(req, res){
  httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl);
  res.render('register', {layout: false, captcha: res.recaptcha});
});

// Register Process
router.post('/register', recaptcha.middleware.verify, function(req, res){

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
  req.checkBody('password2', 'Passwort stimmt nicht überein').equals(req.body.password);

  let errors = req.validationErrors();

  // Validation Errors
  if(errors || req.recaptcha.error){
    res.render('register', {
      errors: errors,
      recaptchaerror: req.recaptcha.error,
      layout: false,
      username: username,
      firstname: firstname,
      email: email
    });
    httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl);
  // Validation Success
  } else {
    let newUser = new User({
      username:username,
      firstname:firstname,
      age: '',
      email:email,
      password:password,
      picture: '/img/avatars/1_32.jpg',
      locked: true,
      type: 'Standard',
      regdate: new Date().toUTCString(),
      logindate:''
    });
    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          applog.error('Password encryption failed: ' + err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            dblog.error('Error saving '+ newUser.username + ': ' + err);
            return;
          } else {
            req.flash('success','Benutzer wurde angelegt. Der Administrator muss dich aber noch freischalten');
            httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl + ' Body: '+ JSON.stringify(req.body));
            res.redirect('/users/login');
          }
        });
      });
    });
  }  
});

// Login Form
router.get('/login', function(req, res){
  httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl);
  res.render('login', {layout: false});
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true,
    badRequestMessage: 'Kein Benutzerkonto oder Passwort eingegeben'
  })(req, res, next);
  httplog.info('User: ' + 'undefined' + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl);
});

// Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  User.findById(req.params.id, function(err, user){
    if (err){
      console.log(err);
      return;
    } else {
      // User Check
      if (user._id == req.user.id || req.user.type == 'Admin'){
        httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl);
        res.render('edit_user', {
          user:user
        });
      } else {
        req.flash('danger','Nicht berechtigt !!');
        res.redirect('/');
      }
    }
  });
});

// Edit Process
router.post('/edit/:id', ensureAuthenticated, function(req, res){
  let user = {};
  // get submitted values 
  user.username = req.body.username;
  user.firstname = req.body.firstname;
  user.age = req.body.age;
  user.email = req.body.email;
  user.picture = req.body.picture;

  let query = {_id:req.params.id}

  User.update(query, user, function(err){
    if (err){
      console.log(err);
      return;
    } else {
      httplog.info('User: ' + req.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl + ' Body: '+ JSON.stringify(req.body));
      res.redirect('/');
    }
  });
});

// Delete User
router.delete('/:id', function(req, res){
  if(!req.user.id){
    res.status(500).send();
  }

  let query = {_id:req.params.id}

  User.findById(req.params.id, function(err, user){

    // User Check
    if (user._id == req.user.id || req.user.type == 'Admin'){
      User.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    } else {
      res.status(500).send();
    }
  });
});

// Logout
router.get('/logout', ensureAuthenticated, function(req, res){
  req.logout();
  req.flash('success', res.locals.user.username + ', du bist ausgeloggt');
  httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl);
  req.logout();
  res.redirect('/users/login');
});

// List all members
router.get('/userlist', ensureAuthenticated, function(req, res){
  User.find({}, function(err, users){
    if(err){
      console.log(err);
    } else {
      httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl);
      res.render('userlist', {
        users: users,
        current_user_id: req.user.id,
        current_user_type: req.user.type
      });
    }
  });
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Bitte erneut einloggen');
    res.redirect('/users/login');
  }
}

module.exports = router;