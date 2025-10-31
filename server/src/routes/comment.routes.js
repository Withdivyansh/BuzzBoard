const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { createComment, getComments, deleteComment } = require('../controllers/comment.controller');

router.post('/', authRequired, createComment);
router.get('/', getComments);
router.delete('/:id', authRequired, deleteComment);

module.exports = router;

