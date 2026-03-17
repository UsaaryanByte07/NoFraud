const Threat = require('../models/Threat');
const { analyzeContent, analyzeFile } = require('../utils/fraudDetector');

// Middleware to check if user is logged in via session
const requireAuth = (req, res, next) => {
    console.log('[requireAuth] session:', req.session?.id, '| user:', req.session?.user?._id || 'NOT FOUND');
    if (!req.session || !req.session.user) {
        console.log('[requireAuth] BLOCKED - No session or user in session');
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }
    next();
};

// @desc    Analyze content for fraud
// @route   POST /api/threats/analyze
// @access  Private
const analyzeThreat = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.user._id;
        console.log('[analyzeThreat] called by userId:', userId, '| content:', content?.substring(0, 50));

        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required for analysis." });
        }

        // 1. Run the content through the fraud detector utility
        console.log('[analyzeThreat] running fraud detection...');
        const analysisResult = await analyzeContent(content);
        console.log('[analyzeThreat] result:', analysisResult);

        // 2. Save the result to the database
        const newThreat = await Threat.create({
            user: userId,
            inputType: analysisResult.inputType,
            content: content,
            isFraud: analysisResult.isFraud === true, // coerce null to false safely
            explanation: analysisResult.explanation || 'Analysis complete.'
        });

        // 3. Return the response to the frontend
        res.status(200).json({
            success: true,
            data: {
                _id: newThreat._id,
                inputType: newThreat.inputType,
                content: newThreat.content,
                isFraud: newThreat.isFraud,
                explanation: newThreat.explanation,
                nextSteps: analysisResult.nextSteps || [],   // not stored in DB, returned directly
                createdAt: newThreat.createdAt
            }
        });

    } catch (error) {
        console.error("[analyzeThreat] CAUGHT ERROR:", error.message, error.stack);
        res.status(500).json({ success: false, message: "Server error during threat analysis." });
    }
};

// @desc    Analyze uploaded file for fraud via VT and Gemini
// @route   POST /api/threats/analyze-file
// @access  Private
const analyzeFileThreat = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.session.user._id;

        if (!file) {
            return res.status(400).json({ success: false, message: "No file uploaded for analysis." });
        }

        console.log(`[analyzeFileThreat] called by userId: ${userId} | file: ${file.originalname} (${file.mimetype})`);

        // 1. Run the file through the VT + Gemini pipeline
        const analysisResult = await analyzeFile(file.buffer, file.originalname, file.mimetype);
        console.log('[analyzeFileThreat] result:', analysisResult);

        // 2. Save the result to the database
        const newThreat = await Threat.create({
            user: userId,
            inputType: analysisResult.inputType,
            content: `[FILE] ${file.originalname}`,
            isFraud: analysisResult.isFraud === true,
            explanation: analysisResult.explanation || 'Analysis complete.'
        });

        // 3. Return response
        res.status(200).json({
            success: true,
            data: {
                _id: newThreat._id,
                inputType: newThreat.inputType,
                content: newThreat.content,
                isFraud: newThreat.isFraud,
                explanation: newThreat.explanation,
                nextSteps: analysisResult.nextSteps || [],
                vtStats: analysisResult.vtStats || null,
                createdAt: newThreat.createdAt
            }
        });

    } catch (error) {
        console.error("[analyzeFileThreat] CAUGHT ERROR:", error.message, error.stack);
        res.status(500).json({ success: false, message: "Server error during file analysis." });
    }
};

// @desc    Get user's threat history
// @route   GET /api/threats/history
// @access  Private
const getUserThreats = async (req, res) => {
    try {
        const userId = req.session.user._id;

        // Fetch threats sorted by newest first
        const threats = await Threat.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: threats.length,
            data: threats
        });

    } catch (error) {
        console.error("Get Threat History Error:", error);
        res.status(500).json({ success: false, message: "Server error fetching threat history." });
    }
};

module.exports = {
    requireAuth,
    analyzeThreat,
    analyzeFileThreat,
    getUserThreats
};
