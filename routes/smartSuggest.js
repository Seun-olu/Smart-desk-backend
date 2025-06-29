const express = require('express');
const router = express.Router();
const { smartSuggest } = require('../controllers/smartSuggestController');

// POST /api/smart-suggest
router.post('/', smartSuggest);

module.exports = router; 