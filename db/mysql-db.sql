CREATE DATABASE IF NOT EXISTS crudbonesdb;
USE crudbonesdb;
DROP TABLE IF EXISTS items;
CREATE TABLE items (
    item_id VARCHAR(128) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created TIMESTAMP NOT NULL,
    PRIMARY KEY (item_id)
) ENGINE=MyISAM;
INSERT INTO items VALUES ( '02a2ce90-1432-11e1-8558-0b488e4fc115', 'Item A', 'Some description for A', NOW() );
INSERT INTO items VALUES ( '710b962e-041c-11e1-9234-0123456789ab', 'Item B', 'Some description for B', NOW() );
