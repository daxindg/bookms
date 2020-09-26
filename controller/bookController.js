
const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const ISBN = require('isbn3');
const { data } = require('jquery');
const async = require('async');
const url = require('url');



exports.list = (req, res) => {

    async.parallel(
        {
            books: function(callback) {
                req.session.dbconn.one('SELECT ceil(count(*)/18.0) count FROM book;')
                .then(
                    data => {
                        var now = req.query.pno || 1;
                        // console.log(now);
                        now = parseInt(now);
                        var pages = [];
                        // var base = '/' + ;
                        var query = req.query;
                        for (let x = now; x <= now + 5; x++) {
                            query.pno = x;
                            pages.push({pno: x, link: '/?' + new URLSearchParams(query).toString()});
                        }
                        query.pno = data.count;
                        var last = '/?' + new URLSearchParams(query).toString();
                        delete query.pno;
                        var first = '/?' + new URLSearchParams(query).toString();
                        var oclk = `var pno=prompt('Jump to page: (1-${data.count})', ${now}); if(pno != null) document.location='${first}' + '&pno='+Math.min(${data.count}, Math.max(1, pno))`
                        
                        var query_conditions = "";
                        var tags = [];
                        var auths = [];
                        var order = "";
                        for (let [k, v] of Object.entries(query)) {
                            if (k.includes('tag_')) {
                                tags.push(k.split('_')[1]);
                            }
                            else if (k.includes('auth_')) {
                                auths.push(k.split('_')[1]);
                            }
                            else if (k.includes('s_text') && v !== '') {
                                // console.log('s_Text', v);
                                order = `similarity(title, '${v}') DESC, `;
                            }
                        }

                        if (tags.length > 0) {
                            query_conditions = `WHERE bid IN (SELECT bid FROM book_tags WHERE tid IN (${tags.join(',')}))`;
                            
                        }

                        if (auths.length > 0 && query_conditions !== "") {
                            query_conditions += `AND bid IN (SELECT bid FROM book_author WHERE aid IN (${auths.join(',')}))`;
                        }
                        else if (auths.length > 0) {
                            query_conditions = `WHERE bid IN (SELECT bid FROM book_author WHERE aid IN (${auths.join(',')}))`;
                        }

                        req.session.dbconn.any(`SELECT bid,isbn,rem, year, page, title, intro, encode(cover, 'base64') cover FROM book ${query_conditions} ORDER BY ${order} bid DESC OFFSET ${(now - 1) * 18} ROWS FETCH NEXT 18 ROWS ONLY `).then(data => {
                            data = data.map(e=>{
                                if (e.cover) e.cover = 'data:image/png;base64,'+e.cover;
                                return e;
                            });
                            var rdata = {
                                books: data,
                            };
                            rdata.pages = pages;
                            rdata.last = last;
                            rdata.first = first;
                            rdata.oclk = oclk;
                            callback(null, rdata);
                        }).catch(err => {
                            console.log(err);
                            callback(null, {});
                        });
                    }
                )
                .catch(err => {
                    console.log(err);
                    callback(null, {});
                })
            },
            tags: function(callback) {
                req.session.dbconn.any("SELECT tid, name FROM tag").then(
                    data => {
                        callback(null, data);
                    }
                ).catch(err => {
                    console.log(err);
                    callback(null, {});
                })
            }
        },
        (err, data) => {
            res.render('index', {title:'BoOkMs', data:data.books, tags:data.tags, user:req.session.user});
        }
    );
};

exports.new_post = [
    body('title', '书名不可为空').isLength({ min: 1 }).trim().escape(),
    body('isbn', 'ISBN 为空或不合法').isISBN().trim().escape().customSanitizer(value => value.split('-').join('')),
    body('year', '出版年...这核里吗').isInt({ min: 1000, max: (new Date()).getFullYear() }),
    body('page', '页数...这河里吗').isInt({ min: 1, max: Number.MAX_SAFE_INTEGER}),
    body('intro', '简介不多于500字').isLength({ max: 500}).trim().escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('new_book', {origin: req.body , errors:errors.array()});
        }
        var book = req.body;
        // console.log(req.body);

        var cover = null;

        if (req.files) {
            cover = req.files.cover.data;
        }

        var r = {scc:true};
        req.session.dbconn.none("INSERT INTO book VALUES (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
            [book.title, book.isbn, book.publisher || null, book.year || null,  book.total || 0, book.rem || 0,  book.has_ebook || false, book.intro || '', ISBN.parse(book.isbn).groupname || null, cover || null, book.page || null]
        ).catch(err => {
            console.log(err);
            r.scc = false;
        });
        res.render('new_book', {origin:r});
    }
];

exports.new_get = (req, res) => {
    res.render('new_book', {origin:{}})
};

exports.detail = (req, res) => {
    req.session.dbconn.one('SELECT title FROM book WHERE bid = $1', req.params.id).then(data => {
        res.send(data);
    }).catch(err => {
        console.log(err)
        res.send('err');
    });
};

exports.delete = (req, res) => {
    req.session.dbconn.none("DELETE FROM book WHERE bid = $1", req.params.id).catch(err => console.log(err));
    res.end();
};

exports.set = [
    body('title', '书名不可为空').optional().isLength({ min: 1 }).trim().escape(),
    body('isbn', 'ISBN 为空或不合法').optional().isISBN().trim().escape().customSanitizer(value => value.split('-').join('')),
    body('year', '出版年...这核里吗').optional().isInt({ min: 1000, max: (new Date()).getFullYear() }),
    body('page', '页数...这河里妈').optional().isInt({ min: 1, max: Number.MAX_SAFE_INTEGER}),
    body('intro', '简介不多于500字').optional().isLength({ max: 500}).trim().escape(),
    (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            return res.send({ok:false, msg:err.array()[0].msg});
        }
        console.log(typeof(req.body));
        for (const [k, v] of Object.entries(req.body)) {
            console.log(k, v);
            req.session.dbconn.any(`UPDATE book SET ${k} = $1 WHERE bid = $2`, [v, req.params.id]).then(d => res.send({ok:true, msg: 'ok'}))
            .catch(e => {
                console.log(e);
                res.send({ok: false, msg: e});
            });
        }
    }
]