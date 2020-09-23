var express = require('express');
var router = express.Router();

var authCont = require('../controller/authorController');

router.get('/', authConst.list);

module.exports = router;