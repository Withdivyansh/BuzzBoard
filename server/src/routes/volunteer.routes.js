const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { applyVolunteer, listVolunteers, updateVolunteerStatus } = require('../controllers/volunteer.controller');

router.post('/', authRequired, applyVolunteer);
router.get('/', authRequired, listVolunteers);
router.patch('/:id', authRequired, updateVolunteerStatus);

module.exports = router;


