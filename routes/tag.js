var express = require('express');
var router = express.Router();

const tagController = require('../controller/tagController');

router.post('/new', tagController.new_post);
router.post('/:tid/:bid/new', tagController.add_tag_to_book);
router.post('/:id/del', tagController.del);
router.post('/:tid/:bid/del', tagController.del_booktag);
router.get('/get/:bid', tagController.get_tag);

module.exports = router;