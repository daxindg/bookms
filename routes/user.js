var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
/* GET users listing. */
router.post('/login',[
    body('username', 'invalid username').isLength({min:3, max:10}).trim().escape(),
    body('password', 'invalid username').isLength({min:8, max:20}).trim().escape(),
    function(req, res) {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            req.session.dbconn.one('SELECT * FROM users WHERE name = $1',[req.body.username])
            .then(
                data => {
                    console.log(data);
                    if (bcrypt.compareSync(req.body.password, data.psw)) {
                        console.log('ok');
                        req.session.user = data;
                        delete req.session.user.psw;
                        console.log(req.session.user);
                        
                    }
                    res.redirect('/');
                }
            )
            .catch(err => {
                console.log('/router/user.js:23', err);
                res.redirect('/');
            })
        }
        else {
            console.log(errors.array());
            res.redirect('/');
        }
        
    }
]);

router.post('/register', [
    body('email').isEmail().trim().escape().custom(async function (val,  {req}) {
        const c = await req.session.dbconn.one('SELECT count(email) FROM users WHERE email=$1', val);
        if (c === 0) {
            return Promise.reject();
        }
    }),
    body('username', 'invalid username').isLength({min:3, max:10}).trim().escape().custom(async function (val,  {req}) {
        const c = await req.session.dbconn.one('SELECT count(name) FROM users WHERE name=$1', val);
        if (c === 0) return Promise.reject();
    }),
    body('password', 'invalid username').isLength({min:8, max:20}).trim().escape(),
    function(req, res) {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            console.log(req.session);
            console.log(req.body);
            const salt = bcrypt.genSaltSync();
            req.session.dbconn.any("INSERT INTO users VALUES(default, $1, $2, $3, 'user')", [req.body.email, req.body.username, bcrypt.hashSync(req.body.password, salt)])
        }
        else console.log(errors.array());
        res.redirect('/');
    }
]);

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})
module.exports = router;
