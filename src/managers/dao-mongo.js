var uuid    = require('node-uuid'),
    helper  = require('../helper');

function DaoMongo(cfg, conn, log) {
    if (!cfg || !conn || !log) {
        throw new Error("Config and connection vars,  and log function are required.");
    }
    this.config = cfg;
    this.connection = conn;
    this.log = log;
}

DaoMongo.prototype.create = function(item, callback) {
    throw new Error('Not implemented');
};

DaoMongo.prototype.update = function(item, callback) {
    throw new Error('Not implemented');
};

DaoMongo.prototype.list = function(itemClass, propNames, callback) {
    throw new Error('Not implemented');
};

DaoMongo.prototype.get = function(itemClass, itemId, callback) {
    throw new Error('Not implemented');
};

DaoMongo.prototype.remove = function(itemClass, itemId, callback) {
    throw new Error('Not implemented');
};


module.exports.DaoMongo = DaoMongo;