const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const { addGallery, getGallery } = require('../controllers/gallery.controller');

router.post('/', authRequired, addGallery);
router.get('/', getGallery);

module.exports = router;


