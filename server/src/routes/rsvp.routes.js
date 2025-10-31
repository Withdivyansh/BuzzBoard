const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { createOrUpdateRSVP, listMyRSVPs, cancelRSVP } = require('../controllers/rsvp.controller');

router.post('/', authRequired, createOrUpdateRSVP);
router.get('/', authRequired, listMyRSVPs);
router.delete('/:eventId', authRequired, cancelRSVP);

module.exports = router;


