var express = require('express');
var router = express.Router();
var bookCont = require('../controller/bookController')

/* GET home page. */
router.get('/', bookCont.list);



module.exports = router;
