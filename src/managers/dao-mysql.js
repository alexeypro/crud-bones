var uuid    = require('node-uuid'),
    helper  = require('../helper');

function DaoMysql(cfg, conn, log) {
    if (!cfg || !conn || !log) {
        throw new Error("Config and connection vars,  and log function are required.");
    }
    this.config = cfg;
    this.connection = conn;
    this.log = log;
}

DaoMysql.prototype.create = function(item, callback) {
    var created = helper.nowUTC();
    var item_id = uuid();
    if (item) {
        item.item_id = item_id;
        item.created = created;
        var itemAsArray = item.asArray();
        var valuesForQuery = '?' + Array(itemAsArray.length).join(',?');
        var queryStr = 'INSERT INTO ' + this.config.dbname + '.' + item.getEntityName() + ' VALUES(' + valuesForQuery + ')';
        this.log('create(): ' + queryStr);
        this.connection.query(queryStr, itemAsArray, function(err) {
            if (callback) {
                callback(false, item);
            }
            return item;
        });
    } else {
        this.log('Error: cannot save item');
        if (callback) {
            callback(true, null);
        }
        return null;
    }
};

DaoMysql.prototype.update = function(item, callback) {
    var updated = helper.nowUTC();
    if (item) {
        item.created = updated;
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
            if (callback) {
                callback(false, item);
            }
            return item;
        });
    } else {
        this.log('Error: cannot update item');
        if (callback) {
            callback(true, null);
        }
        return null;
    }
};

DaoMysql.prototype.list = function(itemClass, propNames, callback) {
    var fields = propNames ? propNames : itemClass.propNamesAsArray;
    var queryStr = 'SELECT ' + fields.join(',') + ' FROM ' + this.config.dbname + '.' + itemClass.entityName + ' ORDER BY ' + itemClass.entityIndex + ' DESC';
    this.log('list(): ' + queryStr);
    this.connection.query(queryStr, function(err, results, fields) {
        if (callback) {
            callback(err, results);
        }
        return results;
    });
};

DaoMysql.prototype.get = function(itemClass, itemId, callback) {
    var queryStr = 'SELECT ' + itemClass.propNamesAsArray.join(',') + ' FROM ' + this.config.dbname + '.' + itemClass.entityName + ' WHERE ' + itemClass.entityIndex + ' = ? LIMIT 1';
    this.log('get(): ' + queryStr);
    this.connection.query(queryStr, [ itemId ], function(err, result, fields) {
        if (callback) {
            callback(err, result ? result[0] : null);
        }
        return result[0];
    });
};

DaoMysql.prototype.remove = function(itemClass, itemId, callback) {
    var queryStr = 'DELETE FROM ' + this.config.dbname + '.' + itemClass.entityName + ' WHERE ' + itemClass.entityIndex + ' = ?';
    this.log('remove(): ' + queryStr);
    this.connection.query(queryStr, [ itemId ], function(err, result, fields) {
        if (callback) {
            callback(err, null);
        }
        return null;
    });
};


module.exports.DaoMysql = DaoMysql;