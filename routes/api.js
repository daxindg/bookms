var express = require('express');
const { body,validationResult } = require('express-validator');
var router = express.Router();
const ISBN = require('isbn3');

router.get('/borrow/list',isLogined, (req, res) => {
    req.session.dbconn.any('SELECT brid, title, borrow.bid, stime, ddl, status FROM borrow, book WHERE borrow.bid = book.bid AND uid = $1', req.session.user.uid)
    .then( data => {
        res.send({ok:true, data:data});
    })
    .catch( err => {
        console.log(err);
        res.send({ok:false, err: err, msg: 'Failed'});
    })
});

router.get('/borrow/pending', isAdmin, (req, res) => {
    // console.log('brpd');
    req.session.dbconn.any(`SELECT name username, brid, title, borrow.bid, stime, ddl, status FROM borrow, book, users WHERE status LIKE 'pending%' AND users.uid = borrow.uid AND borrow.bid = book.bid`)
    .then(data => {
        res.send({ok:true, data: data});
    })
    .catch(
        err => {
            console.log(err);
            res.send({ok:false, err:err, msg:'an error occured'})
        }
    );
});

router.post('/borrow/accept/:brid/', isAdmin, (req, res) => {
    req.session.dbconn.tx(async t => {

        var { status, bid } = await t.one('SELECT status, bid FROM borrow WHERE brid = $1', req.params.brid);
        // console.log(status, bid);
        if (status === 'pending_borrow') {
            await t.none('UPDATE book SET rem = rem - 1 WHERE bid = $1', bid);
            await t.none(`UPDATE borrow SET status = 'ok', ddl = CURRENT_TIMESTAMP + '7D'::interval WHERE brid = $1`, req.params.brid);
        }
        else if (status === 'pending_return') {
            await t.none('UPDATE book SET rem = rem + 1 WHERE bid = $1', bid);
            await t.none(`UPDATE borrow SET status = 'returned' WHERE brid = $1`, req.params.brid);
        }
    })
    .then(data => {
        res.send({ok:true, data:data});
    })
    .catch( err => {
        console.log(err);
        res.send({ok: false, err: err});
    });
});


router.post('/borrow/:bid/',isLogined, (req, res) => {

    req.session.dbconn.any(`INSERT INTO borrow(uid, bid, stime, ddl, status, brid) VALUES($1, $2, default, null, 'pending_borrow', default) RETURNING *`, [req.session.user.uid, req.params.bid])
    .then(
        data => {
            res.send({ok:true, data: data});
        }
    )
    .catch(
        err => {
            console.log(err);
            res.send({ok:false, err:err});
        }
    )
})

router.post('/return/:brid/',isLogined, (req, res) => {
    var bruid =  [req.session.user.uid, req.params.brid];
    req.session.dbconn.tx(async t => {
        var { status } = await t.one('SELECT status FROM borrow WHERE uid=$1 AND brid=$2', bruid);
        console.log(status);
        if (status === 'pending_borrow') {
            await t.none('DELETE FROM borrow WHERE uid=$1 AND brid=$2', bruid);
        }
        else if (status === 'ok') {
            await t.none(`UPDATE borrow SET status='pending_return' WHERE uid = $1 AND brid = $2`, bruid);
        }
        return {};
    })
    .then(data => {
        res.send({ok:true, data:data});
    })
    .catch(err => {
        console.log(err);
        res.send({ok:true, err:err, msg: "Failed"})
    });
});

router.post('/book/new', isAdmin, [
    body('title', '书名不可为空').isLength({ min: 1 }).trim().escape(),
    body('isbn', 'ISBN 为空或不合法').isISBN().trim().escape().customSanitizer(value => value.split('-').join('')),
    body('year', '出版年...这核里吗').isInt({ min: 1000, max: (new Date()).getFullYear() }),
    body('page', '页数...这河里吗').isInt({ min: 1, max: Number.MAX_SAFE_INTEGER}),
    body('intro', '简介不多于500字').isLength({ max: 500}).trim().escape(),
    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ok:false, err:errors.array()});
        }

        var book = req.body;
        console.log(req.body);

        var cover = null;
        console.log(req.files);

        if (req.files) {
            cover = req.files.cover.data;
        }

        var langroup = ISBN.parse(book.isbn).groupname.split(',')[0];
        // console.log(langroup);
        var authors = JSON.parse(book.authors);
        var tags = JSON.parse(book.tags);
        req.session.dbconn.tx( async t => {
            var {bid} = await t.one("INSERT INTO book VALUES (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING bid",
            [book.title, book.isbn, book.publisher || null, book.year || null,  book.total || 0, book.rem || book.total || 0,  book.has_ebook || false, book.intro || '', langroup || null, cover || null, book.page || null]);
            for (let tid of tags) {
                await t.none('INSERT INTO book_tags VALUES($1, $2)', [bid, tid]).catch(err => console.log(err));
            }
            for (let aid of authors) {
                await t.none('INSERT INTO book_author VALUES($1, $2)', [bid, aid]).catch(err => console.log(err));
            }
            
        } )
        .then( data => {
            res.send({ok:true});
        })
        .catch( err => {
            console.log(err);
            res.send({ok:false, err:err});
        });
    }
]);

router.post('/book/del/:bid/', isAdmin, (req, res) => {
    req.session.dbconn.none('DELETE FROM book WHERE bid=$1', req.params.bid)
    .then( () => res.send({ok:true}) )
    .catch( err => {
        console.log(err);
        res.send({ok:false, err:err});
    });
});


router.post('/author/new/:name/', isAdmin,[
    (req, res) => {
        req.session.dbconn.one('INSERT INTO author VALUES(default, $1, 0) RETURNING aid, name', req.params.name)
        .then(
            data => {
                res.send({ok: true, data:data});
            }
        )
        .catch( err => {
            console.log(err);
            res.send({ok:false, err:err});
        });
    }
]);

router.get('/author/search/:name/', [
    (req, res) => {
        req.session.dbconn.any('SELECT aid, name FROM author ORDER BY similarity(name, $1) DESC FETCH FIRST 4 ROW ONLY', req.params.name)
        .then(
            data => {
                res.send({ok:true, data:data});
            }
        )
        .catch( err => {
            console.log(err);
            res.send({ok:false, err:err});
        });
    }
]);

router.get('/author/get/:bid/', (req, res) => {
    req.session.dbconn.any('SELECT bid, author.aid, name FROM book_author, author WHERE author.aid = book_author.aid AND bid=$1', req.params.bid)
    .then( data => {
        res.send({ok:true, data:data});
    })
    .catch( err => {
        console.log(err);
        res.send({ok:false, err:err});
    })
})

router.post('/author/del/:bid/:aid/',isAdmin, (req, res) => {
    req.session.dbconn.none('DELETE FROM book_author WHERE bid = $1 AND aid = $2', [req.params.bid, req.params.aid])
    .then( () => {
        res.send({ok:true});
    })
    .catch( err => {
        console.log(err);
        res.send({ok:false, err:err});
    })
});














function isLogined(req, res, next) {
    if (!req.session.user) {
        res.send({ok:false, msg:'Please login'});
        return;
    }
    else next();
}

function isAdmin(req, res, next) {
    if (!req.session.user || req.session.user.class != 'admin') {
        res.send({ok:false, msg: 'Permission denied'});
        return;
    }
    else next();
}

module.exports = router;