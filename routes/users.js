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

// Register Form
router.get('/register', recaptcha.middleware.render, function(req, res){
  httplog.info('Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: '+ req.originalUrl);
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
  // Validation Success
  } else {
    let newUser = new User({
      username:username,
      firstname:firstname,
      email:email,
      password:password,
      picture:'empty',
      locked: true,
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
            console.log('user registred');
            req.flash('success','Benutzer wurde angelegt. Der Administrator muss dich aber noch freischalten');
            res.redirect('/users/login');
          }
        });
      });
    });
  }  
});

// Login Form
router.get('/login', function(req, res){
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
});

// Logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', res.locals.user.username + ', du bist ausgeloggt');
  res.redirect('/users/login');
});

module.exports = router;