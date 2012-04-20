app = module.parent.exports.app;

app.get('/hello', function(req, res) {
    app.logmessage('/hello');
    app.logmessage('mysql = ' + app.mysqlClient);
    app.logmessage('redis = ' + app.redisClient);
    app.logmessage('mongo = ' + app.mongoClient);
    res.send('Hello World!');
    return;
});

app.get('/item/:id', function(req, res) {
    app.logmessage('/item/:id');
    app.logmessage('id = ' + req.params.id);
    res.send('#' + req.params.id);
    return;
});

app.get('/feed.xml', function(req, res) {
    res.contentType(app.defs.CONTENTTYPE_XML);
    app.logmessage('/feed');
    res.render('feed.xml.ejs', {
        message : 'Hello World!'
    });
    return;
});