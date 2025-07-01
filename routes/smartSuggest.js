const express = require('express');
const router = express.Router();
const { smartSuggest } = require('../controllers/smartSuggestController');
const requireAuth = require('../middleware/requireAuth');

// POST /api/smart-suggest (protected)
router.post('/', requireAuth, smartSuggest);

module.exports = router;