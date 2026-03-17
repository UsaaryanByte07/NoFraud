const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeThreat, getUserThreats, analyzeFileThreat, requireAuth } = require('../controllers/threatController');

// Multer setup: keep files in memory as a buffer rather than writing to disk
const upload = multer({ storage: multer.memoryStorage() });

// Protect all threat routes using session attached user
router.use(requireAuth);

router.post('/analyze', analyzeThreat);
router.post('/analyze-file', upload.single('file'), analyzeFileThreat);
router.get('/history', getUserThreats);

module.exports = router;
