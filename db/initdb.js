const { adminconn } = require('./dbconn');

adminconn.none(`
create extension pg_trgm;

CREATE TABLE books (
    bid serial PRIMARY KEY,
    title varchar(50) NOT NULL,
    isbn varchar(50) NOT NULL UNIQUE,
    pub varchar(20),
    year character(4),
    total int CHECK (total >= 0),
    rem int CHECK (rem >= 0),
    intro text,
    lang varchar(10),
    page int
    cover bytea,
);

create index book_title_trgm_idx on books using GIN(title gin_trgm_ops);



CREATE TABLE authors (
    aid serial PRIMARY KEY,
    name varchar(20) NOT NULL UNIQUE,
    bcount int DEFAULT 0 CHECK(bcount >= 0)
);

create index author_name_trgm_idx on authors using GIN(name gin_trgm_ops);


CREATE TABLE tags (
    tid serial PRIMARY KEY,
    name varchar(20) NOT NULL UNIQUE,
    bcount int DEFAULT 0 CHECK(bcount >= 0)
);

CREATE TABLE users (
    uid serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    name varchar(20) UNIQUE NOT NULL,
    psw text NOT NULL,
    class text NOT NULL CHECK(class IN ('admin', 'user', 'guest', 'banned', 'god'))
);

CREATE TABLE book_author (
    bid int REFERENCES book ON DELETE CASCADE,
    aid int REFERENCES author,
    PRIMARY KEY (bid, aid)
);

CREATE TABLE book_tag (
    bid int REFERENCES book ON DELETE CASCADE,
    tid int REFERENCES tag,
    PRIMARY KEY (bid, tid)
);

CREATE TABLE _borrow (
    brid serial PRIMARY KEY,
    uid int NOT NULL REFERENCES users,
    bid int NOT NULL REFERENCES book,
    stime timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ddl timestamp DEFAULT CURRENT_TIMESTAMP + '7D'::interval,
    status text CHECK(status IN ('ok', 'pending_borrow', 'pending_return', 'overtime', 'returned'))
);


CREATE VIEW userprofile  AS 
SELECT users.uid, email, name, count(brid), class FROM users LEFT JOIN borrow ON users.uid = borrow.uid AND status = 'returned' GROUP BY users.uid;


CREATE FUNCTION inc_tags_bcount() RETURNS TRIGGER
AS $$
BEGIN
UPDATE tags SET bcount = bcount + 1 WHERE tags.tid = NEW.tid;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION dec_tags_bcount() RETURNS TRIGGER
AS $$
BEGIN
UPDATE tags SET bcount = bcount - 1 WHERE tags.tid = OLD.tid;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER book_tag_trigger_after_insert AFTER INSERT ON book_tag FOR EACH ROW EXECUTE FUNCTION inc_tags_bcount();
CREATE TRIGGER book_tag_trigger_after_delete AFTER DELETE ON book_tag FOR EACH ROW EXECUTE FUNCTION dec_tags_bcount();

CREATE FUNCTION inc_authors_bcount() RETURNS TRIGGER
AS $$
BEGIN
UPDATE authors SET bcount = bcount + 1 WHERE authors.aid = NEW.aid;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE FUNCTION dec_authors_bcount() RETURNS TRIGGER
AS $$
BEGIN
UPDATE authors SET bcount = bcount - 1 WHERE authors.aid = OLD.aid;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER book_author_trigger_after_insert AFTER INSERT ON book_author FOR EACH ROW EXECUTE FUNCTION inc_authors_bcount();
CREATE TRIGGER book_author_trigger_after_delete AFTER DELETE ON book_author FOR EACH ROW EXECUTE FUNCTION dec_authors_bcount();



CREATE OR REPLACE FUNCTION _borrow()
RETURNS TABLE(brid int,
    uid int,
    bid int,
    stime timestamp,
    ddl timestamp,
    status text)
AS $$
BEGIN

UPDATE borrow SET status = 'overtime' WHERE borrow.status = 'ok' AND CURRENT_TIMESTAMP > borrow.ddl;
RETURN QUERY SELECT borrow.brid, borrow.uid, borrow.bid, borrow.stime, borrow.ddl, borrow.status FROM borrow;

END;
$$ LANGUAGE plpgsql;
`).catch(err => console.log(err));