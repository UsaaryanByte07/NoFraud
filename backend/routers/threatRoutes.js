const express = require('express');
const router = express.Router();
const { analyzeThreat, getUserThreats, requireAuth } = require('../controllers/threatController');

// Protect all threat routes using session attached user
router.use(requireAuth);

router.post('/analyze', analyzeThreat);
router.get('/history', getUserThreats);

module.exports = router;
