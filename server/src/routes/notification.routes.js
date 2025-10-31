const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { listMyNotifications, markRead } = require('../controllers/notification.controller');

router.get('/', authRequired, listMyNotifications);
router.patch('/:id/read', authRequired, markRead);

module.exports = router;



