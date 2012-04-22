var uuid        = require('node-uuid'),
    helper      = require('../helper'),
    dateformat  = require('dateformat');

function DaoMysql(cfg, conn, log, cache) {
    if (!cfg || !conn || !log) {
        throw new Error("Config and connection vars,  and log function are required.");
    }
    this.config = cfg;
    this.connection = conn;
    this.log = log;
    this.cache = cache;
}

DaoMysql.prototype.registerModel = function(itemClass) {
    // Don't need this here, but keeping for compataibility with my other DAOs.
    return;
};

DaoMysql.prototype.create = function(item, callback) {
    var that = this;
    var created = dateformat('yyyy-mm-dd HH:MM:ss');
    var item_id = uuid();
    if (item) {
        item[ item.getEntityIndex() ] = item_id;
        item[ item.getEntityCreated() ] = created;
        var itemAsArray = item.asArray();
        var valuesForQuery = '?' + Array(itemAsArray.length).join(',?');
        var queryStr = 'INSERT INTO ' + this.config.dbname + '.' + item.getEntityName() + ' VALUES(' + valuesForQuery + ')';
        this.log('create(): ' + queryStr);
        this.connection.query(queryStr, itemAsArray, function(err) {
            if (err) {
                that.log('Error: create(): ' + err);
            } else if (that.cache) {
                that.cache.putItem(item);                   // cache item
                that.cache.delItems(item.getClass());       // clear all items cache
            }
            if (callback) {
                callback(err, item);
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

DaoMysql.prototype.update = function(item, callback) {
    var that = this;
    var updated = dateformat('yyyy-mm-dd HH:MM:ss');
    if (item) {
        item[ item.getEntityCreated() ] = updated;
        // we assume first element in props is an index
        var propNames = item.getPropNamesAsArray();
        var slicedFields = propNames.slice(-propNames.length+1);
        var fieldsStr = slicedFields.join(' = ?, ') + ' = ?';
        var asArray = item.asArray();
        var itemAsArrayWithMovedIndex = asArray.splice(-asArray.length+1);
        itemAsArrayWithMovedIndex.push(asArray[0]);
        var queryStr = 'UPDATE ' + this.config.dbname + '.' + item.getEntityName() + ' SET ' + fieldsStr + ' WHERE ' + item.getEntityIndex() + ' = ?';
        this.log('update(): ' + queryStr);
        //this.log('update(): ' + itemAsArrayWithMovedIndex);
        this.connection.query(queryStr, itemAsArrayWithMovedIndex, function(err) {
            if (err) {
                that.log('Error: update(): ' + err);
            } else if (that.cache) {
                that.cache.putItem(item);               // cache item
                that.cache.delItems(item.getClass());   // clear all items cache
            }
            if (callback) {
                callback(err, item);
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

DaoMysql.prototype.list = function(itemClass, propNames, callback) {
    var that = this;
    if (this.cache) {
        this.cache.getItems(itemClass, function(cachedErr, cachedResult) {   // get from cache
            if (cachedErr || !cachedResult) {
                var fields = propNames ? propNames : itemClass.propNamesAsArray;
                var queryStr = 'SELECT ' + fields.join(',') + ' FROM ' + that.config.dbname + '.' + itemClass.entityName + ' ORDER BY ' + itemClass.entityIndex + ' DESC';
                that.log('list(): ' + queryStr);
                that.connection.query(queryStr, function(err, results, fields) {
                    if (err) {
                        that.log('Error: list(): ' + err);
                    } else if (that.cache) {
                        that.cache.putItems(itemClass, results);            // cache all items
                    }
                    if (callback) {
                        callback(err, results);
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

DaoMysql.prototype.get = function(itemClass, itemId, callback) {
    var that = this;
    if (this.cache) {
        this.cache.getItem(itemClass, itemId, function(cachedErr, cachedResult) {   // get from cache
            if (cachedErr || !cachedResult) {
                var queryStr = 'SELECT ' + itemClass.propNamesAsArray.join(',') + ' FROM ' + that.config.dbname + '.' + itemClass.entityName + ' WHERE ' + itemClass.entityIndex + ' = ? LIMIT 1';
                that.log('get(): ' + queryStr);
                that.connection.query(queryStr, [ itemId ], function(err, result, fields) {
                    var itemResult = result ? result[0] : null;
                    if (err) {
                        that.log('Error: get(): ' + err);
                    } else if (that.cache) {
                        that.cache.putItemByClass(itemClass, itemResult);     // put to cache
                    }
                    if (callback) {
                        callback(err, itemResult);
                    }
                    return itemResult;
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

DaoMysql.prototype.remove = function(itemClass, itemId, callback) {
    var that = this;
    var queryStr = 'DELETE FROM ' + this.config.dbname + '.' + itemClass.entityName + ' WHERE ' + itemClass.entityIndex + ' = ?';
    this.log('remove(): ' + queryStr);
    this.connection.query(queryStr, [ itemId ], function(err, result, fields) {
        if (err) {
            that.log('Error: remove(): ' + err);
        } else if (that.cache) {
            that.cache.delItem(itemClass, itemId);      // del item from cache
            that.cache.delItems(itemClass);             // clear all items cache
        }
        if (callback) {
            callback(err, null);
        }
        return null;
    });
};


module.exports.DaoMysql = DaoMysql;