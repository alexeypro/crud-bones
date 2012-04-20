var app,
    util            = require('util'),
    cluster         = require('cluster'),
    express         = require('express'),
    winston         = require('winston'),
    async           = require('async'),
    mysql           = require('mysql'),
    mongoose        = require('mongoose'),
    redis           = require('redis');

var envConfig       = require('config')
    CFG_SERVER      = envConfig.server,
    CFG_DB_MYSQL    = envConfig.dbMysql,
    CFG_DB_MONGO    = envConfig.dbMongo,
    CFG_STORE_REDIS = envConfig.storeRedis;

var port            = process.env.PORT || CFG_SERVER.port,
    forks           = process.env.FORKS || CFG_SERVER.forks;

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
    message = '#' + (process.env.NODE_WORKER_ID ? process.env.NODE_WORKER_ID : 'M') + ': ' + message;
    if (winston) {
        winston.log('info', message);
    } else {
        console.log(message);
    }
}

// creating and configuring server
var app = express.createServer();

// let's load app with more stuff and export it
app.envConfig = envConfig;
app.logmessage = logmessage;

// we want to set up connections only on "workers, not on cluster/master
if (process.env.NODE_WORKER_ID) {
    // and we want to do this in parallel, but make sure we do it before continuing with starting server..
    async.parallel({
        mysqlConnection: function(cb1) {
            // if mysql configuration is there...
            if (CFG_DB_MYSQL) {
                var mysqlConfig = {
                    host: CFG_DB_MYSQL.host,
                    port: CFG_DB_MYSQL.port,
                    user: CFG_DB_MYSQL.username,
                    password: CFG_DB_MYSQL.password,
                    database: CFG_DB_MYSQL.dbname
                };
                logmessage('MySQL config: ' + JSON.stringify(mysqlConfig));
                var mysqlClient = mysql.createClient(mysqlConfig);
                cb1(null, mysqlClient);
            } else {
                cb1(null, null);
            }
        },
        mongoConnection: function(cb2) {
            // if mongo configuration is there...
            if (CFG_DB_MONGO) {
                var mongoURI = 'mongodb://' + CFG_DB_MONGO.username + ':' + CFG_DB_MONGO.password + '@' + CFG_DB_MONGO.host + ':' + CFG_DB_MONGO.port + '/' + CFG_DB_MONGO.dbname;
                logmessage('MongoDB config: ' + mongoURI);
                var mongoClient = mongoose.createConnection(mongoURI);
                cb2(null, mongoClient);
            } else {
                cb2(null, null);
            }
        },
        redisConnection: function(cb3) {
            // if redis configuration is there...
            if (CFG_STORE_REDIS) {
                var redisClient = redis.createClient(CFG_STORE_REDIS.port, CFG_STORE_REDIS.host); 
                redisClient.auth(CFG_STORE_REDIS.password, function() {
                    redisClient.select(CFG_STORE_REDIS.dbname, function(err,res) {
                        logmessage('Redis config: ' + redisClient.host + ':' + redisClient.port + ' @ ' + redisClient.selected_db + ' with ' + redisClient.auth_pass);
                        cb3(null, redisClient);
                    });
                });
            } else {
                cb3(null, null);
            }
        },
    },
    // here we get all of the connections and run the actual server
    function(err, results) {
        logmessage('Came back with ' + Object.keys(results).length + ' connection(s)...');
        app.mysqlClient = results.mysqlConnection;
        app.mongoClient = results.mongoConnection;
        app.redisClient = results.redisConnection;

        // configure our server
        app.configure(function() {
            app.use(express.bodyParser());
            app.use(express.methodOverride());
        });

        // here load rest-api so we don't clutter this piece of code more
        require('./api-rest');

        app.listen(port, function() {
            app.logmessage('Listening on :' + port + ' in "' + app.settings.env + '" mode...');
            return 0;
        });
    });
}

// this is the cluster setup
if (cluster.isMaster) {
    app.logmessage('Staring ' + forks + ' fork(s)');
    for (var i = 0; i < forks; i++) {
        var worker = cluster.fork();
    }
}

// export app everywhere
module.exports.app = app;