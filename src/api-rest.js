app = module.parent.exports.app;

var util        = require('util'),
    helper      = require('./helper'),
    DaoMysql    = require('./managers/dao-mysql').DaoMysql,
    Item        = require('./models/item').Item;

var dao         = new DaoMysql(app.envConfig.dbMysql, app.mysqlClient, app.logmessage);

//TODO: make it put and use params
app.get('/create.jsonp', function(req, res) {
    app.logmessage('/create');
    res.contentType(app.defs.CONTENTTYPE_JSON);
    res.send({ status: app.defs.RESPONSE_OK });
    var i = new Item(null, 'Hello World', 'This is the "Hello World" description', null);
    dao.create(i, function(error, result) {
        app.logmessage('/created done');
        return;
    });
});

app.get('/', function(req, res) {
    app.logmessage('/');
    dao.list(Item, null, function(err, results) {
        app.logmessage('/ done');
        res.contentType(app.defs.CONTENTTYPE_HTML);
        res.render('index.html.ejs', { results: results, siteUrl: app.envConfig.server.siteUrl });
        return;
    });
});

app.get('/feed.jsonp', function(req, res) {
    app.logmessage('/feed');
    dao.list(Item, null, function(err, results) {
        app.logmessage('/feed done');
        res.contentType(app.defs.CONTENTTYPE_JSON);
        res.send({ status: app.defs.RESPONSE_OK, results: results });
        return;
    });
});

app.get('/feed.xml', function(req, res) {
    app.logmessage('/feed');
    dao.list(Item, null, function(err, results) {
        app.logmessage('/feed done');
        res.contentType(app.defs.CONTENTTYPE_XML);
        res.render('feed.xml.ejs', { results: results, siteUrl: app.envConfig.server.siteUrl, updated: helper.nowUTC() });
        return;
    });
});

app.get('/retrieve/:id.html', function(req, res) {
    app.logmessage('/retrieve/' + req.params.id);
    dao.get(Item, req.params.id, function(err, result) {
        app.logmessage('/retrieve/' + req.params.id + ' done');
        if (result) {
            res.contentType(app.defs.CONTENTTYPE_HTML);
            res.render('retrieve.html.ejs', { result: result, siteUrl: app.envConfig.server.siteUrl });
        } else {
            res.send({ status: app.defs.RESPONSE_ERROR }, 404);
        }
        return;
    });
});

app.get('/retrieve/:id.jsonp', function(req, res) {
    app.logmessage('/retrieve/' + req.params.id);
    dao.get(Item, req.params.id, function(err, result) {
        app.logmessage('/retrieve/' + req.params.id + ' done');
        if (result) {
            res.contentType(app.defs.CONTENTTYPE_JSON);
            res.send({ status: app.defs.RESPONSE_OK, result: result });
        } else {
            res.send({ status: app.defs.RESPONSE_ERROR }, 404);
        }
        return;
    });
});

//TODO: not done at all
app.get('/update/:id.jsonp', function(req, res) {
    app.logmessage('/update/:id');
    res.contentType(app.defs.CONTENTTYPE_JSON);
    res.send({ status: app.defs.RESPONSE_ERROR });
    throw new Error('Not implemented!');
    return;
});

var deleteImplementation = function(req, res) {
    app.logmessage('/delete/' + req.params.id);
    res.contentType(app.defs.CONTENTTYPE_JSON);
    res.send({ status: app.defs.RESPONSE_OK });
    dao.remove(Item, req.params.id, function(error, result) {
        app.logmessage('/delete/' + req.params.id + ' done');
        return;
    });
};
app.del('/delete/:id.jsonp', deleteImplementation);
app.post('/delete/:id.jsonp', deleteImplementation);

