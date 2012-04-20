app = module.parent.exports.app;

app.get('/hello', function(req, res) {
    app.logmessage('/hello');
    app.logmessage('mysql = ' + app.mysqlClient);
    app.logmessage('redis = ' + app.redisClient);
    app.logmessage('mongo = ' + app.mongoClient);
    return res.send('Hello World!');
});
