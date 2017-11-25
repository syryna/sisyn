
// Used Components
const express = require('express');                     // App Server
const mongoose = require('mongoose');                   // Mongo DB
const bodyParser = require('body-parser');              // HTML Body Parser
const expressValidator = require('express-validator');  // Express Validation in Forms
// see middleware section  require('express-messages')  // send messages
const session = require('express-session');             // server side storage
const flash = require('connect-flash');                 // store messages in server storage
const path = require('path');                           // Path
const winston = require('winston');                     // Logger
const passport = require('passport');                   //Passport

const config = require('./config/database');

// Connect to Mongo DB
const mongourl = config.database;
mongoose.connect(mongourl, { useMongoClient: true });
global.mongodb = mongoose.connection;                   // GLOBAL

// Check connection to Mongo DB
mongodb.once('open', function(err){
  if(err){
    applog.error('Connect to Mongo DB failed: ' + err);
  } else {
    applog.info('Connected to Mongo DB: ' + mongourl);
  }
});

// Check for DB errors
mongodb.on('error', function(err){
  dblog.error('An Error occured: ' + err);
});

// Init Winston logger
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create Loggers
const tsFormat = () => (new Date()).toLocaleTimeString();

  global.applog = new (winston.Logger)({                // GLOBAL
    transports: [
      new (winston.transports.Console)({
        timestamp: tsFormat,
        colorize: true,
        level: 'info'
      }),
      new (require('winston-daily-rotate-file'))({
        filename: `${logDir}/-app.log`,
        timestamp: tsFormat,
        datePattern: 'yyyy-MM-dd',
        prepend: true,
        level: env === 'development' ? 'verbose' : 'info'
      })
    ]
  });

  global.httplog = new (winston.Logger)({               // GLOBAL
    transports: [
      new (winston.transports.Console)({
        timestamp: tsFormat,
        colorize: true,
        level: 'info'
      }),
      new (require('winston-daily-rotate-file'))({
        filename: `${logDir}/-http.log`,
        timestamp: tsFormat,
        datePattern: 'yyyy-MM-dd',
        prepend: true,
        level: env === 'development' ? 'verbose' : 'info'
      })
    ]
  });

  global.dblog = new (winston.Logger)({                 // GLOBAL
    transports: [
      new (winston.transports.Console)({
        timestamp: tsFormat,
        colorize: true,
        level: 'info'
      }),
      new (require('winston-daily-rotate-file'))({
        filename: `${logDir}/-db.log`,
        timestamp: tsFormat,
        datePattern: 'yyyy-MM-dd',
        prepend: true,
        level: env === 'development' ? 'verbose' : 'info'
      })
    ]
  });

// Init App
const app = express();

// Load PUG View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Bring in Models for Mongo DB
let User = require('./models/user');

// Body Perser Middleware
app.use(bodyParser.urlencoded({ extended: false }));  //parse application/x-www-form-urlencoded
app.use(bodyParser.json());                           // parse application/json

// Set public folder to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req,res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;
    while(namespace.lenght){
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Routes for the App
app.get("/", function(req, res){
  let micha_array = [
    {
      id:1,
      title:'Article One',
      author:'Brad',
      body:'This is body of one'
    },
    {
      id:2,
      title:'Article Two',
      author:'Micha',
      body:'This is body of TWO'
    },
  ];
  req.flash('success','nur ein test');
  res.render("index", {
    title:'Hello',
    articles:micha_array
  });
});

app.get("/dashboard", function(req, res){
  res.render("dashboard")
});

app.get("/corp_member", function(req, res){
  let query = '{}';
  User.find(query, function(err, users){
    if(err){
      dblog.error('Error finding Users: ' + err);
    } else {
      dblog.info('Query on "user": ' + query + ' Result: ' + users);
      res.render("corp_member", {
        users:users
      });
    }
  });
});

// Route files
let users = require('./routes/users');
app.use('/users', users);

// Start express server
app.listen(3001, function(err){
  if(err){
    applog.error('Server start failed: ' + err);
  } else {
    applog.info('Server up: http://localhost:3001');
  }
});
