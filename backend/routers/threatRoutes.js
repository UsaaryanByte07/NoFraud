const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeThreat, getUserThreats, analyzeFileThreat, requireAuth } = require('../controllers/threatController');



const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } 
});


router.use(requireAuth);

router.post('/analyze', analyzeThreat);
router.post('/analyze-file', upload.single('file'), analyzeFileThreat);
router.get('/history', getUserThreats);

module.exports = router;
