var express = require('express');
const { body, validationResult } = require('express-validator');
var router = express.Router();
const ISBN = require('isbn3');




// -----------------borrow--------------------

router.get('/borrow/list', isLogined, (req, res) => {
    req.session.dbconn.any(`SELECT brid, title, borrow.bid bid, to_char(stime,'YY-MM-DD HH24:MI:SS') stime, to_char(ddl,'YY-MM-DD HH24:MI:SS') ddl, status FROM borrow, books WHERE borrow.bid = books.bid AND uid = $1 ORDER BY ddl DESC`, req.session.user.uid)
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err, msg: 'Failed' });
        })
});

router.get('/borrow/pending', isAdmin, (req, res) => {
    // console.log('brpd');
    req.session.dbconn.any(`SELECT name username, brid, title, borrow.bid bid, to_char(stime,'YY-MM-DD HH24:MI:SS') stime, to_char(ddl,'YY-MM-DD HH24:MI:SS') ddl, status FROM borrow, books, users WHERE status LIKE 'pending%' AND users.uid = borrow.uid AND borrow.bid = books.bid ORDER BY ddl DESC`)
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(
            err => {
                console.log(err);
                res.send({ ok: false, err: err, msg: 'an error occured' })
            }
        );
});

router.post('/borrow/accept/:brid/', isAdmin, (req, res) => {
    req.session.dbconn.tx(async t => {

        var { status, bid } = await t.one('SELECT status, bid FROM borrow WHERE brid = $1', req.params.brid);
        // console.log(status, bid);
        if (status === 'pending_borrow') {
            await t.none('UPDATE books SET rem = rem - 1 WHERE bid = $1', bid);
            await t.none(`UPDATE borrow SET status = 'ok', ddl = CURRENT_TIMESTAMP + '7D'::interval WHERE brid = $1`, req.params.brid);
        }
        else if (status === 'pending_return') {
            await t.none('UPDATE books SET rem = rem + 1 WHERE bid = $1', bid);
            await t.none(`UPDATE borrow SET status = 'returned' WHERE brid = $1`, req.params.brid);
        }
    })
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        });
});

router.post('/borrow/reject/:brid/', isAdmin, (req, res) => {
    req.session.dbconn.tx(async t => {

        var { status, bid } = await t.one('SELECT status, bid FROM borrow WHERE brid = $1', req.params.brid);
        // console.log(status, bid);
        if (status === 'pending_borrow') {
            await t.none(`DELETE FROM borrow WHERE brid = $1`, req.params.brid);
        }
        else if (status === 'pending_return') {
            await t.none(`UPDATE borrow SET status = 'ok' WHERE brid = $1`, req.params.brid);
        }
    })
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        });
});


router.post('/borrow/:bid/', [notBanned, isLogined, (req, res) => {

    req.session.dbconn.any(`INSERT INTO borrow(uid, bid, stime, ddl, status, brid) VALUES($1, $2, default, null, 'pending_borrow', default) RETURNING *`, [req.session.user.uid, req.params.bid])
        .then(
            data => {
                res.send({ ok: true, data: data });
            }
        )
        .catch(
            err => {
                console.log(err);
                res.send({ ok: false, err: err });
            }
        )
}]);

router.post('/return/:brid/', isLogined, (req, res) => {
    var bruid = [req.session.user.uid, req.params.brid];
    req.session.dbconn.tx(async t => {
        var { status } = await t.one('SELECT status FROM borrow WHERE uid=$1 AND brid=$2', bruid);
        console.log(status);

        if (status === 'pending_borrow') {
            await t.none('DELETE FROM borrow WHERE uid=$1 AND brid=$2', bruid);
        }
        else if (status === 'ok') {
            var { brid } = await t.one(`UPDATE borrow SET status='pending_return' WHERE uid = $1 AND brid = $2 RETURNING brid`, bruid);
        }
        return { brid };
    })
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: true, err: err, msg: "Failed" })
        });
});



// ------------book-------------

router.get('/book/list', (req, res) => {

    req.session.dbconn.tx(async t => {
        var { count } = await t.one(`SELECT reltuples::bigint AS count FROM pg_class WHERE oid = 'books'::regclass;`);
        var now = req.query.pno || 1;

        count = Math.ceil(parseFloat(count) / 18);
        now = Math.min(count, parseInt(now));

        var query = req.query;
        var query_conditions = "";
        var tags = JSON.parse(query.tags || '[]');
        var auths = JSON.parse(query.authors || '[]');
        var order = "";

        if (tags.length > 0) {
            query_conditions = `WHERE bid IN (SELECT bid   FROM book_tag GROUP BY bid HAVING ARRAY[${tags.join(',')}] <@ array_agg(tid))`;
        }

        if (auths.length > 0 && query_conditions !== "") {
            query_conditions += `AND bid IN (SELECT bid as authors FROM book_author GROUP BY bid HAVING ARRAY[${auths.join(',')}] <@ array_agg(aid)) `;
        }
        else if (auths.length > 0) {
            query_conditions = `WHERE bid IN (SELECT bid as authors FROM book_author GROUP BY bid HAVING ARRAY[${auths.join(',')}] <@ array_agg(aid))`;
        }
        if (query.s_text) {
            let x = ISBN.parse(query.s_text);
            if (x && x.isValid) {
                query_conditions = `WHERE isbn = '${query.s_text.split('-').join('').trim()}'`;
            }
            else {
                order = `similarity(title, '${query.s_text}') DESC, `;
            }
        }

        // var books = await t.any(`SELECT bid, isbn, total, rem, year, page, title, intro, 'data:image/png;base64,' || encode(cover, 'base64') cover FROM books ${query_conditions} ORDER BY ${order} bid DESC OFFSET ${(now - 1) * 18} ROWS FETCH NEXT 18 ROWS ONLY `);
        var books = await t.any(`SELECT bid,pub, isbn, total, rem, year, page, title, intro FROM books ${query_conditions} ORDER BY ${order} bid DESC OFFSET ${(now - 1) * 18} ROWS FETCH NEXT 18 ROWS ONLY `);

        return { books, count };
    })
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        });

});

router.post('/book/new', isAdmin, [
    body('title', '书名不可为空').isLength({ min: 1 }).trim().escape(),
    body('isbn', 'ISBN 为空或不合法').isISBN().trim().escape().customSanitizer(value => value.split('-').join('')),
    body('year', '出版年...这核里吗').isInt({ min: 1000, max: (new Date()).getFullYear() }),
    body('page', '页数...这河里吗').isInt({ min: 1, max: Number.MAX_SAFE_INTEGER }),
    body('intro', '简介不多于500字').isLength({ max: 500 }).trim().escape(),
    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.send({ ok: false, err: errors.array() });
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
        req.session.dbconn.tx(async t => {
            var { bid } = await t.one("INSERT INTO books VALUES (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING bid",
                [book.title, book.isbn, book.pub || null, book.year || null, book.total || 0, book.rem || book.total || 0, book.has_ebook || false, book.intro || '', langroup || null, cover || null, book.page || null]);
            for (let tid of tags) {
                await t.none('INSERT INTO book_tag VALUES($1, $2)', [bid, tid]).catch(err => console.log(err));
            }
            for (let aid of authors) {
                await t.none('INSERT INTO book_author VALUES($1, $2)', [bid, aid]).catch(err => console.log(err));
            }

        })
            .then(data => {
                res.send({ ok: true });
            })
            .catch(err => {
                console.log(err);
                res.send({ ok: false, err: err });
            });
    }
]);

router.get('/book/:bid/cover', (req, res) => {
    req.session.dbconn.one(`SELECT 'data:image/png;base64,' || encode(cover, 'base64') cover FROM books WHERE bid = $1`, [req.params.bid])
        .then(data => res.send({ ok: true, data: data }))
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        });
});

router.post('/book/:bid/setcover', isAdmin, (req, res) => {
    if (req.files && req.files.cover) {
        console.log(req.files);
        req.session.dbconn.none('UPDATE books SET cover = $1 WHERE bid = $2', [req.files.cover.data, req.params.bid])
            .then(() => res.send({ ok: true }))
            .catch(err => {
                console.log(err);
                res.send({ ok: false, err: err });
            });
    }
    else {
        res.send({ ok: false, msg: 'file upload failed' });
    }
});

router.post('/book/:bid/set', isAdmin, [
    body('title', '书名不可为空').optional().isLength({ min: 1 }).trim().escape(),
    body('isbn', 'ISBN 为空或不合法').optional().isISBN().trim().escape().customSanitizer(value => value.split('-').join('')),
    body('year', '出版年...这核里吗').optional().isInt({ min: 1000, max: (new Date()).getFullYear() }),
    body('page', '页数...这河里妈').optional().isInt({ min: 1, max: Number.MAX_SAFE_INTEGER }),
    body('intro', '简介不多于500字').optional().isLength({ max: 500 }).trim().escape(),
    (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.send({ ok: false, msg: err.array()[0].msg });
        }
        console.log(typeof (req.body));
        for (const [k, v] of Object.entries(req.body)) {
            // console.log(k, v);
            req.session.dbconn.one(`UPDATE books SET ${k} = $1 WHERE bid = $2 RETURNING ${k}`, [v, req.params.bid]).then(data => res.send({ ok: true, msg: 'ok', data: data }))
                .catch(e => {
                    console.log(e);
                    res.send({ ok: false, msg: e });
                });
        }
    }
]);

router.post('/book/del/:bid/', isAdmin, (req, res) => {
    req.session.dbconn.none('DELETE FROM books WHERE bid=$1', req.params.bid)
        .then(() => res.send({ ok: true }))
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        });
});

// --------------------tag------------------------

router.get('/tag/list', (req, res) => {
    req.session.dbconn.any('SELECT * FROM tags')
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        })
});

router.get('/tag/list/:bid', (req, res) => {
    req.session.dbconn.any('SELECT tags.* FROM book_tag, tags WHERE tags.tid = book_tag.tid AND bid = $1', req.params.bid)
        .then(data => {
            res.send({
                ok: true,
                data: data
            });
        })
        .catch(err => {
            console.log(err);
            res.send({
                ok: false,
                err: { err: err, msg: '' }
            });
        })
});

router.post('/tag/new', isAdmin, [
    body('name', 'min length 1').isLength({ min: 1 }).trim().escape(),

    (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            // console.log(err);
            return res.send({ ok: false, msg: '标签名非法' });
        }

        // var result = 
        console.log(req.body.name);
        req.session.dbconn.one("INSERT INTO tags VALUES(default, $1, 0) RETURNING *", req.body.name).then(data => {
            res.send({ ok: true, data: data });
        }).catch(err => {
            console.log(err);
            res.send({ ok: false, err: err, msg: '标签名不可用' });
        });
    }
]);

router.post('/tag/add/:tid/:bid/', isAdmin, (req, res) => {
    console.log(req.params);
    req.session.dbconn.any("INSERT INTO book_tag VALUES($1, $2)", [req.params.bid, req.params.tid])
        .then(
            result => {
                res.send({ ok: true, bid: req.params.bid, tid: req.params.tid });
            }
        )
        .catch(err => {
            console.log(err);
            res.send({ ok: false });
        });
});

router.post('/tag/del/:tid/', isAdmin, (req, res) => {
    req.session.dbconn.one("DELETE FROM tags WHERE tid=$1 RETURNING tid", req.params.tid).then(data => {
        res.send({ ok: true, msg: '删除标签成功', data: data });
    }).catch(err => {
        res.send({ ok: false, msg: '删除标签失败' });
    });
});

router.post('/tag/del/:tid/:bid/', isAdmin, (req, res) => {
    req.session.dbconn.one("DELETE FROM book_tag WHERE bid = $1 AND tid = $2 RETURNING tid", [req.params.bid, req.params.tid])
        .then((data) => {
            res.send({ ok: true, msg: '删除标签成功', data: data });
        }).catch(err => {
            console.log(err);
            res.send({ ok: false, msg: '删除标签失败' });
        });
});



// -------------------author----------------------

router.post('/author/new/', isAdmin, [
    (req, res) => {
        req.session.dbconn.one('INSERT INTO authors VALUES(default, $1, 0) RETURNING *', req.body.name.trim())
            .then(
                data => {
                    res.send({ ok: true, data: data });
                }
            )
            .catch(err => {
                console.log(err);
                res.send({ ok: false, err: err, msg: '作者已存在' });
            });
    }
]);

router.get('/author/search/:name/', [
    (req, res) => {
        req.session.dbconn.any('SELECT * FROM authors ORDER BY similarity(name, $1) DESC FETCH FIRST 4 ROW ONLY', req.params.name)
            .then(
                data => {
                    res.send({ ok: true, data: data });
                }
            )
            .catch(err => {
                console.log(err);
                res.send({ ok: false, err: err });
            });
    }
]);

router.get('/author/list/:bid/', (req, res) => {
    req.session.dbconn.any('SELECT authors.* FROM book_author, authors WHERE authors.aid = book_author.aid AND bid=$1', req.params.bid)
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        })
})

router.post('/author/add/:aid/:bid/', isAdmin, (req, res) => {

    req.session.dbconn.any("INSERT INTO book_author VALUES($1, $2) RETURNING aid", [req.params.bid, req.params.aid])
        .then(
            data => {
                res.send({ ok: true, data: data });
            }
        )
        .catch(err => {
            console.log(err);
            res.send({ ok: false });
        });
});

router.post('/author/del/:aid', isAdmin, (req, res) => {
    req.session.dbconn.one('DELETE FROM authors WHERE aid = $1 RETURNING *', [req.params.aid])
        .then((data) => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        })
});

router.post('/author/del/:aid/:bid/', isAdmin, (req, res) => {
    req.session.dbconn.one('DELETE FROM book_author WHERE bid = $1 AND aid = $2 RETURNING aid', [req.params.bid, req.params.aid])
        .then(data => {
            res.send({ ok: true, data: data });
        })
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        })
});





// ------------------------user-----------------------------

router.get('/user/list', isAdmin, (req, res) => {
    req.session.dbconn.any(`SELECT uid, name, email, class FROM users`)
        .then(data => res.send({ ok: true, data: data }))
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        })
});

router.get('/user', isLogined, (req, res) => {
    req.session.dbconn.one(`SELECT * FROM userprofile WHERE uid = $1`, req.session.user.uid)
        .then(data => res.send({ ok: true, data: data }))
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        })
})

router.post('/user/setclass/:uid/:class/', isAdmin, (req, res) => {
    // if (req.session.user.class !== 'god') {
    //     res.send({ ok: false, msg: 'Permission denied' });
    //     return;
    // }
    req.session.dbconn.one(`UPDATE users SET class = $1 WHERE uid = $2 RETURNING class`, [req.params.class, req.params.uid])
        .then(data => res.send({ ok: false, data: data }))
        .catch(err => {
            console.log(err);
            res.send({ ok: false, err: err });
        })
})




// ---------------authutil------------------

function isLogined(req, res, next) {
    if (!req.session.user) {
        res.send({ ok: false, msg: 'Please login' });
        return;
    }
    else next();
}

function isAdmin(req, res, next) {
    if (!req.session.user || (req.session.user.class !== 'admin' && req.session.user.class !== 'god')) {
        res.send({ ok: false, msg: 'Permission denied' });
        return;
    }
    else next();
}

function notBanned(req, res, next) {
    if (!req.session.user || req.session.user.class === 'banned') {
        res.send({ ok: false, msg: 'Permission denied' });
        return;
    }
    else next();
}



module.exports = router;