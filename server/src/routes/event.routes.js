const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { listEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/event.controller');

router.get('/', listEvents);
router.post('/', authRequired, createEvent);
router.patch('/:id', authRequired, updateEvent);
router.delete('/:id', authRequired, deleteEvent);

module.exports = router;


