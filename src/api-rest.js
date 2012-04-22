app = module.parent.exports.app;

var util        = require('util'),
    helper      = require('./helper'),
    DaoMysql    = require('./managers/dao-mysql').DaoMysql,
    DaoMongo    = require('./managers/dao-mongo').DaoMongo,
    CacheRedis  = require('./managers/cache-redis').CacheRedis,
    Item        = require('./models/item').Item;

// Hint: not necessary, if you specify it to null/undefined DAO will not use it at all.
var cache       = new CacheRedis(app.envConfig.storeRedis, app.redisClient, app.logmessage, app.defs.DEFAULT_CACHE_EXPIRE_SECS);

// Hint: uncomment the line with MySQL and it'll be working with MySQL. :-) Magic, right?
//var dao         = new DaoMysql(app.envConfig.dbMysql, app.mysqlClient, app.logmessage, cache);
var dao         = new DaoMongo(app.envConfig.dbMongo, app.mongoClient, app.logmessage, cache);

dao.registerModel(Item);

var createImplementation = function(req, res) {
    app.logmessage('/create');
    res.contentType(app.defs.CONTENTTYPE_JSON);
    res.send({ status: app.defs.RESPONSE_INPROCESS });
    var i = new Item(null, req.body.title, req.body.description, null);
    app.logmessage('/create Item = ' + i.asArray());
    dao.create(i, function(error, result) {
        app.logmessage('/created done');
        return;
    });
};
app.post('/create.jsonp', createImplementation);
app.put('/create.jsonp', createImplementation);

app.get('/', function(req, res) {
    app.logmessage('/');
    dao.list(Item, null, function(err, results) {
        app.logmessage('/ done');
        res.contentType(app.defs.CONTENTTYPE_HTML);
        res.render('index.html.ejs', { results: results || [] , siteUrl: app.envConfig.server.siteUrl });
        return;
    });
});

app.get('/feed.jsonp', function(req, res) {
    app.logmessage('/feed');
    dao.list(Item, null, function(err, results) {
        app.logmessage('/feed done');
        res.contentType(app.defs.CONTENTTYPE_JSON);
        res.send({ status: app.defs.RESPONSE_OK, results: results || [] });
        return;
    });
});

app.get('/feed.xml', function(req, res) {
    app.logmessage('/feed');
    dao.list(Item, null, function(err, results) {
        app.logmessage('/feed done');
        res.contentType(app.defs.CONTENTTYPE_XML);
        res.render('feed.xml.ejs', { results: results || [] , siteUrl: app.envConfig.server.siteUrl, updated: helper.nowUTC() });
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

app.post('/update/:id.jsonp', function(req, res) {
    app.logmessage('/update/' + req.params.id);
    res.contentType(app.defs.CONTENTTYPE_JSON);
    res.send({ status: app.defs.RESPONSE_INPROCESS });
    var i = new Item(req.body.item_id, req.body.title, req.body.description, req.body.created);
    app.logmessage('/update/' + req.params.id + ' Item = ' + i.asArray());
    dao.update(i, function(error, result) {
        app.logmessage('/update/' + req.params.id + ' done');
        return;
    });
});

var deleteImplementation = function(req, res) {
    app.logmessage('/delete/' + req.params.id);
    res.contentType(app.defs.CONTENTTYPE_JSON);
    res.send({ status: app.defs.RESPONSE_INPROCESS });
    dao.remove(Item, req.params.id, function(error, result) {
        app.logmessage('/delete/' + req.params.id + ' done');
        return;
    });
};
app.del('/delete/:id.jsonp', deleteImplementation);
app.post('/delete/:id.jsonp', deleteImplementation);

