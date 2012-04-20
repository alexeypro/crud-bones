var app,
    express     = require('express'),
    winston     = require('winston'),
    CFG_SERVER  = require('config').server;

// our catcher for log messages
process.addListener('uncaughtException', function (err, stack) {
    var message = 'Caught exception: ' + err + '\n' + err.stack;
    if (app && app.logmessage) {
        app.logmessage(message);
    } else {
        console.log(message);
    }
});

// basically a wrapper around logger
var logmessage = function(message) {
    if (winston) {
        winston.log('info', message);
    } else {
        console.log(message);
    }
}

// creating and configuring server
var app = express.createServer();

// let's export app and kick logger to app
app.logmessage = logmessage;
module.exports.app = app;

// use port from environment or from the appropriate config
var port = process.env.PORT || CFG_SERVER.port;

// let's listen on the port
app.listen(port, function() {
    app.logmessage('Listening on :' + port + ' in "' + app.settings.env + '" mode...');
    return 0;
});

// configure our server
app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
});

// here load rest-api so we don't clutter this piece of code more
require('./api-rest.js');
