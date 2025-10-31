const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { listClubs, createClub, joinClub, approveJoinRequest, listMembers, listJoinRequests, myJoinRequests } = require('../controllers/club.controller');

router.get('/', listClubs);
router.post('/', authRequired, createClub);
router.post('/:id/join', authRequired, joinClub);
router.get('/:id/join-requests', authRequired, listJoinRequests);
router.patch('/:id/join-requests/:reqId', authRequired, approveJoinRequest);
router.get('/:id/members', authRequired, listMembers);
router.get('/me/requests', authRequired, myJoinRequests);

module.exports = router;


