const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Bring in User Models
let User = require('../models/user');

// Register Form
router.get('/register', function(req, res){
  res.render('register', {layout: false});
});

// Register Process
router.post('/register', function(req, res){
  const username = req.body.username;
  const firstname = req.body.firstname;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('username', 'Benutzer wird benötigt').notEmpty();
  req.checkBody('firstname', 'Vorname wird benötigt').notEmpty();
  req.checkBody('email', 'E-Mail wird benötigt').notEmpty();
  req.checkBody('email', 'E-Mail nicht gültig').isEmail();
  req.checkBody('password', 'Passwort wird benötigt').notEmpty();
  req.checkBody('password2', 'Passwort stimmt nicht überein').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors: errors,
      layout: false
    });
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

router.get('/login', function(req, res){
  res.render('login', {layout: false});
});

module.exports = router;
