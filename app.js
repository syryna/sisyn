// Used Components
const express = require('express'); // App Server
const mongoose = require('mongoose'); // Mongo DB
const bodyParser = require('body-parser'); // HTML Body Parser
const expressValidator = require('express-validator'); // Express Validation in Forms
// see middleware section  require('express-messages')  // send messages
const session = require('express-session'); // server side storage
const flash = require('connect-flash'); // store messages in server storage
const path = require('path'); // Path
const winston = require('winston'); // Logger
const passport = require('passport'); // Passport

const config = require('./config/database');

// Connect to Mongo DB
const mongourl = config.database;
mongoose.connect(mongourl, {
    useMongoClient: true
});
global.mongodb = mongoose.connection; // GLOBAL

// Check connection to Mongo DB
mongodb.once('open', function(err) {
    if (err) {
        applog.error('Connect to Mongo DB failed: ' + err);
    } else {
        applog.info('Connected to Mongo DB: ' + mongourl);
    }
});

// Check for DB errors
mongodb.on('error', function(err) {
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

global.applog = new(winston.Logger)({ // GLOBAL
    transports: [
        new(winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: 'info'
        }),
        new(require('winston-daily-rotate-file'))({
            filename: `${logDir}/-app.log`,
            timestamp: tsFormat,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            level: env === 'development' ? 'verbose' : 'info'
        })
    ]
});

global.httplog = new(winston.Logger)({ // GLOBAL
    transports: [
        new(winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: 'info'
        }),
        new(require('winston-daily-rotate-file'))({
            filename: `${logDir}/-http.log`,
            timestamp: tsFormat,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            level: env === 'development' ? 'verbose' : 'info'
        })
    ]
});

global.dblog = new(winston.Logger)({ // GLOBAL
    transports: [
        new(winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: 'info'
        }),
        new(require('winston-daily-rotate-file'))({
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
const server = require('http').createServer(app);
const io = require('socket.io')(server);// Socket.io for the chat

// Load PUG View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Bring in Models for Mongo DB
let User = require('./models/user');
let Chat = require('./models/chat');

// Set public folder to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Body Perser Middleware
app.use(bodyParser.urlencoded({
    extended: false
})); //parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

// Express Session Middleware
app.use(session({
    secret: 'mysecretstuff',
    resave: true,
    saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;
        while (namespace.lenght) {
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

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Routes for the App
app.get("/", ensureAuthenticated, function(req, res) {
    // Placeholder
    httplog.info('User: ' + res.locals.user.username + ' Type: ' + req.method + ' - Prot: ' + req.protocol + ' Path: ' + req.originalUrl);

});

// Route files
let users = require('./routes/users');
app.use('/users', users);
let account = require('./routes/account');
app.use('/account', account);
let overview = require('./routes/overview');
app.use('/overview', overview);

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Bitte erneut einloggen');
        res.redirect('/users/login');
    }
}

// Start express server
app.listen(3001, function(err) {
    if (err) {
        applog.error('Server start failed: ' + err);
    } else {
        applog.info('Server up: http://localhost:3001');
    }
});
server.listen(3002, function(err) {
    if (err) {
        applog.error('SocketIO Server start failed: ' + err);
    } else {
        applog.info('SocketIO Server up: http://localhost:3002');
    }
});


// Chat logic
io.on('connection', function(client) {  

    client.on('join', function(data) {
        applog.info(data);
        // boradcast all chat messages
        Chat.aggregate(
            { $lookup: { from: 'users', localField: 'userid', foreignField: '_id', as: 'userdata' } },
            { $project: { userid: 1, username: 1, message: 1, timestamp: 1, picture: '$userdata.picture' } },
            { $unwind : "$picture" },
            { $limit: 100 },
            { $sort: { timestamp: 1 } }
            , function(err, messages) {
            if (err) {
                dblog.error('Error finding Chat Messages: ' + err);
                return;
            } else {
                client.emit('broad', messages); 
            }
        }); 
    });

    client.on('messages', function(data) {
        // save chat in Mongo DB
        const newMessage = new Chat({
            userid: data.userid,
            username: data.username,
            message: data.text,
            timestamp: new Date().toUTCString()
        });
        newMessage.save(function(err, message) {
            if (err) {
                dblog.error('Error saving new Chat Message: ' + newMessage.username + ' from User: ' + newMessage.userid + ': '  + err);
                return;
            } else {
                dblog.info('Saving new Chat message: ' + JSON.stringify(newMessage));
                // boradcast current chat message
                Chat.aggregate(
                    { $lookup: { from: 'users', localField: 'userid', foreignField: '_id', as: 'userdata' } },
                    { $project: { userid: 1, username: 1, message: 1, timestamp: 1, picture: '$userdata.picture' } },
                    { $unwind : "$picture" },
                    { $match : { _id: message._id } }
                    , function(err, messages) {
                    if (err) {
                        dblog.error('Error finding Chat Messages: ' + err);
                        return;
                    } else {
                        client.emit('broad', messages);
                        client.broadcast.emit('broad',messages);  
                    }
                }); 
            }
        });
        
        
    });

});