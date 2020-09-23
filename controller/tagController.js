const { body, sanitizeBody, validationResult } = require('express-validator');
const { adminconn } = require('../db/dbconn');

exports.new_post = [
    body('name', 'min length 1').isLength({min:1}).trim().escape(),

    (req, res) => {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            // console.log(err);
            return res.send({ok:false, msg:'标签名非法'});
        }

        // var result = 
        console.log(req.body.name);
        adminconn.none("INSERT INTO tag VALUES(default, $1)", req.body.name).then(result=>{
            res.send({ok:true, msg:'新建标签成功'});
        }).catch( err => {
                console.log(err);
                res.send({ok:false, msg:'重复标签名'});
            }
        )
    }
]

exports.get_tag = (req, res) => {
    adminconn.any('SELECT tag.tid, name FROM book_tags, tag WHERE tag.tid = book_tags.tid AND bid = $1', req.params.bid)
    .then(data => {
        res.send({
            ok:true,
            bid: req.params.bid,
            tags:data
        });
    })
    .catch(err => {
        console.log(err);
        res.send({
            ok:false,
            bid:req.params.bid
        });
    })
}

exports.add_tag_to_book = (req, res) => {
    console.log(req.params);
    adminconn.any("INSERT INTO book_tags VALUES($1, $2)", [req.params.bid, req.params.tid])
    .then(
        result => {
            res.send({ok:true, bid: req.params.bid, tid: req.params.tid});
        }
    )
    .catch(err => {
        console.log(err);
        res.send({ok:false});
    });
}

exports.del = (req, res) => {
    adminconn.none("DELETE FROM tag WHERE tid=$1", req.params.id).then(result=>{
        res.send({ok:true, msg:'删除标签成功'});
    }).catch(err => {
        res.send({ok:false, msg:'删除标签失败'});
    });
}

exports.del_booktag = (req, res) => {
    adminconn.none("DELETE FROM book_tags WHERE bid = $1 AND tid = $2", [req.params.bid, req.params.tid])
    .then ((result) => {
        res.send({ok:true, msg:'删除标签成功'});
    }).catch(err => {
        console.log(err);
        res.send({ok:false, msg:'删除标签失败'});
    });
}
