function Item(id, title, description, created) {
    this.item_id = id;
    this.title = title;
    this.description = description;
    this.created = created;
}

// every Model should implement the following stuff. 
// TODO: find a better way to do that!!!

Item.entityName = 'items';
Item.entityIndex = 'item_id';
Item.entityExpiration = 60*5;     // in seconds
Item.entityCreated = 'created';
Item.entitySchema = { item_id: String, title: String, description: String, created: Date};
Item.propNamesAsArray = [ 'item_id', 'title', 'description', 'created' ];

Item.prototype.getClass = function() {
    return Item;
};

Item.prototype.getEntityName = function() {
    return Item.entityName;
};

Item.prototype.getEntityIndex = function() {
    return Item.entityIndex;
};

Item.prototype.getEntityExpiration = function() {
    return Item.entityExpiration;
};

Item.prototype.getEntityCreated = function() {
    return Item.entityCreated;
};

Item.prototype.getEntitySchema = function() {
    return Item.entitySchema;
};

Item.prototype.getPropNamesAsArray = function() {
    return Item.propNamesAsArray;
};

Item.prototype.asArray = function() {
    return [
        this.item_id,
        this.title,
        this.description,
        this.created
    ];
};

module.exports.Item = Item;