var uuid        = require('node-uuid'),
    mongoose    = require('mongoose'),
    util        = require('util'),
    helper      = require('../helper'),
    dateformat  = require('dateformat');

function DaoMongo(cfg, conn, log) {
    if (!cfg || !conn || !log) {
        throw new Error("Config and connection vars,  and log function are required.");
    }
    this.config = cfg;
    this.connection = conn;
    this.log = log;
    this.models = { };
}

DaoMongo.prototype.registerModel = function(itemClass) {
    var modelName = helper.capitalize(itemClass.entityName + 'MongoModel');
    this.models[modelName] = new mongoose.Schema( itemClass.entitySchema );
};

DaoMongo.prototype.create = function(item, callback) {
    var that = this;
    var created = dateformat('yyyy-mm-dd HH:MM:ss');
    var item_id = uuid();
    if (item) {
        item[ item.getEntityIndex() ] = item_id;
        item[ item.getEntityCreated() ] = created;
        var modelName = helper.capitalize(item.getEntityName() + 'MongoModel');
        var NeededMongoModel = this.connection.model(modelName, this.models[modelName]);
        var m = new NeededMongoModel();
        var propNames = item.getPropNamesAsArray();
        // basically here we load all data from item into this mongo model
        for (var i = 0; i != propNames.length; i++) {
            m[ propNames[i] ] = item[ propNames[i] ];
        }
        that.log( util.inspect(m) );
        m.save(function(err) {
            if (err) {
                that.log('Error: create(): ' + err);
            }
            if (callback) {
                callback(false, item);
            }
            return item;
        });
    } else {
        this.log('Error: create(): cannot save item');
        if (callback) {
            callback(true, null);
        }
        return null;
    }
};

DaoMongo.prototype.update = function(item, callback) {
    throw new Error('Not implemented');
};

DaoMongo.prototype.list = function(itemClass, propNames, callback) {
    var modelName = helper.capitalize(itemClass.entityName + 'MongoModel');
    var NeededMongoModel = this.connection.model(modelName, this.models[modelName]);
    var query = NeededMongoModel.find( { } );
    query.execFind(function (err, results) {
        if (err) {
            that.log('Error: list(): ' + err);
        }
        if (callback) {
            callback(false, results);
        }
        return results;
    }); 
};

DaoMongo.prototype.get = function(itemClass, itemId, callback) {
    throw new Error('Not implemented');
};

DaoMongo.prototype.remove = function(itemClass, itemId, callback) {
    throw new Error('Not implemented');
};


module.exports.DaoMongo = DaoMongo;