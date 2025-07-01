const express = require('express');
const router = express.Router();
const { register, login, checkAuth } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', require('../controllers/authController').logout);
router.get('/me', requireAuth, checkAuth);

module.exports = router;
