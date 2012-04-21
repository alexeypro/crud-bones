function Item(id, title, description, created) {
    this.item_id = id;
    this.title = title;
    this.description = description;
    this.created = created;
}

Item.entityName = 'items';
Item.entityIndex = 'item_id';
Item.propNamesAsArray = [ 'item_id', 'title', 'description', 'created' ];

Item.prototype.getEntityName = function() {
    return Item.entityName;
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