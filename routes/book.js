var express = require('express');
var router = express.Router();

var bookCont = require('../controller/bookController');

router.get('/', bookCont.list);
router.get('/list/', bookCont.list);
router.get('/new', bookCont.new_get);
router.post('/new', bookCont.new_post);
router.get('/:id', bookCont.detail);
router.post('/:id/inc/', bookCont.detail);
router.post('/:id/dec/', bookCont.detail);
router.post('/:id/add/', bookCont.detail);
router.post('/:id/del/', bookCont.delete);
router.post('/:id/set/', bookCont.set);
module.exports = router;