const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { register, login, me, updateProfile } = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authRequired, me);
router.put('/me', authRequired, updateProfile);

module.exports = router;


