var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
/* GET users listing. */
router.post('/login', [
    body('username', 'invalid username').isLength({ min: 3, max: 10 }).trim().escape(),
    body('password', 'invalid username').isLength({ min: 8, max: 20 }).trim().escape(),
    function (req, res) {

        if (req.session.user !== undefined) {
            res.send({ ok: true, data: req.session.user });
            return;
        }
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            req.session.dbconn.one('SELECT * FROM users WHERE name = $1', [req.body.username])
                .then(
                    data => {
                        console.log(data);
                        if (bcrypt.compareSync(req.body.password, data.psw)) {
                            console.log('ok');
                            req.session.user = data;
                            delete req.session.user.psw;
                            console.log(req.session.user);
                            res.send({ ok: true, data: req.session.user });
                        }
                        else {
                            res.send({ ok: false, err: { key: password, msg: '密码错误' } });
                        }

                    }
                )
                .catch(err => {
                    console.log('/router/user.js:31', err);
                    res.send({ ok: false, err: { key: username, msg: '用户不存在' } });
                })
        }
        else {
            console.log(errors.array());
            res.send({ ok: false, err: errors.array() });
        }

    }
]);

router.post('/register', [
    body('email').isEmail().trim().escape().custom(async function (val, { req }) {
        let {count} = await req.session.dbconn.one('SELECT count(email) FROM users WHERE email=$1', val);
        // console.log('email', count);
        count = parseInt(count);
        if (count !== 0) {
            // console.log('emailf', count);

            return Promise.reject('邮箱已注册');
        }
        return Promise.resolve();
    }),
    body('username', 'invalid username').isLength({ min: 3, max: 10 }).trim().escape().custom(async function (val, { req }) {
        let {count} = await req.session.dbconn.one('SELECT count(name) FROM users WHERE name=$1', val);
        count = parseInt(count);
        // console.log('username', count);
        if (count !== 0) {
            // console.log('usernamef', count);

            return Promise.reject('用户名已注册');
        }
        return Promise.resolve();
    }),
    body('password', '密码长度 8-20').isLength({ min: 8, max: 20 }).trim().escape(),
    function (req, res) {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            
            const salt = bcrypt.genSaltSync();
            req.session.dbconn.one("INSERT INTO users VALUES(default, $1, $2, $3, 'user') RETURNING *", [req.body.email, req.body.username, bcrypt.hashSync(req.body.password, salt)])
                .then(data => {
                    res.send({ok:true, data:data});
                }
                )
                .catch(err => {
                    console.log(err);
                    res.send({ ok: false, err: err });
                });

        }
        else {
            
            res.send({ok:false, err:errors.array()});
        }

    }
]);

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.send({ ok: true });
})
module.exports = router;
