var uuid        = require('node-uuid'),
    mongoose    = require('mongoose'),
    util        = require('util'),
    helper      = require('../helper'),
    dateformat  = require('dateformat');

function DaoMongo(cfg, conn, log, cache) {
    if (!cfg || !conn || !log) {
        throw new Error("Config and connection vars,  and log function are required.");
    }
    this.config = cfg;
    this.connection = conn;
    this.log = log;
    this.models = { };
    this.cache = cache;
}

DaoMongo.prototype.registerModel = function(itemClass) {
    var that = this;
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
            } else if (that.cache) {
                that.cache.putItem(item);                   // cache item
                that.cache.delItems(item.getClass());       // clear all items cache
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
    var that = this;
    var created = dateformat('yyyy-mm-dd HH:MM:ss');
    if (item) {
        var modelName = helper.capitalize(item.getEntityName() + 'MongoModel');
        var NeededMongoModel = this.connection.model(modelName, this.models[modelName]);
        var itemId = (item.asArray())[0];
        var findObj = { };
        findObj[ item.getEntityIndex() ] = itemId;
        var propNames = item.getPropNamesAsArray();
        var slicedFields = propNames.slice(-propNames.length+1);    // without index
        var updateObj = { };
        for (var i = 0; i != slicedFields.length; i++) {
            updateObj[ slicedFields[i] ] = item[ slicedFields[i] ];
        }
        this.log('update(): ' + JSON.stringify(findObj));
        this.log('update(): ' + JSON.stringify(updateObj));
        var options = { };
        NeededMongoModel.update(findObj, { $set: updateObj }, options, function(err){
            if (err) {
                that.log('Error: update(): ' + err);
            } else if (that.cache) {
                that.cache.putItem(item);               // cache item
                that.cache.delItems(item.getClass());   // clear all items cache
            }
            if (callback) {
                callback(false, item);
            }
            return item;
        });
    } else {
        this.log('Error: update(): cannot update item');
        if (callback) {
            callback(true, null);
        }
        return null;
    }
};

DaoMongo.prototype.list = function(itemClass, propNames, callback) {
    var that = this;
    if (this.cache) {
        this.cache.getItems(itemClass, function(cachedErr, cachedResult) {   // get from cache
            if (cachedErr || !cachedResult) {
                var modelName = helper.capitalize(itemClass.entityName + 'MongoModel');
                var NeededMongoModel = that.connection.model(modelName, that.models[modelName]);
                var query = NeededMongoModel.find( { } );
                query.execFind(function (err, results) {
                    if (err) {
                        that.log('Error: list(): ' + err);
                    } else if (that.cache) {
                        that.cache.putItems(itemClass, results);            // cache all items
                    }
                    if (callback) {
                        callback(false, results);
                    }
                    return results;
                }); 
            } else {
                if (callback) {
                    callback(false, cachedResult);
                }
                return cachedResult;
            }
        });
    }
};

DaoMongo.prototype.get = function(itemClass, itemId, callback) {
    var that = this;
    if (this.cache) {
        this.cache.getItem(itemClass, itemId, function(cachedErr, cachedResult) {   // get from cache
            if (cachedErr || !cachedResult) {
                var modelName = helper.capitalize(itemClass.entityName + 'MongoModel');
                var NeededMongoModel = that.connection.model(modelName, that.models[modelName]);
                var findObj = { };
                findObj[ itemClass.entityIndex ] = itemId;
                NeededMongoModel.findOne(findObj, function (err, result) {
                    if (err) {
                        that.log('Error: get(): ' + err);
                    } else if (that.cache) {
                        that.cache.putItemByClass(itemClass, result);     // put to cache
                    }
                    if (callback) {
                        callback(false, result);
                    }
                    return result;
                });
            } else {
                if (callback) {
                    callback(false, cachedResult);
                }
                return cachedResult;
            }
        });
    }
};

DaoMongo.prototype.remove = function(itemClass, itemId, callback) {
    var that = this;
    var modelName = helper.capitalize(itemClass.entityName + 'MongoModel');
    var NeededMongoModel = this.connection.model(modelName, this.models[modelName]);
    var findObj = { };
    findObj[ itemClass.entityIndex ] = itemId;
    NeededMongoModel.remove(findObj, function (err, result) {
        if (err) {
            that.log('Error: remove(): ' + err);
        } else if (that.cache) {
            that.cache.delItem(itemClass, itemId);      // del item from cache
            that.cache.delItems(itemClass);             // clear all items cache
        }
        if (callback) {
            callback(false, result);
        }
        return result;
    });    
};

module.exports.DaoMongo = DaoMongo;