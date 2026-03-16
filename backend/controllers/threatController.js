const Threat = require('../models/Threat');
const { analyzeContent } = require('../utils/fraudDetector');

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
                createdAt: newThreat.createdAt
            }
        });

    } catch (error) {
        console.error("[analyzeThreat] CAUGHT ERROR:", error.message, error.stack);
        res.status(500).json({ success: false, message: "Server error during threat analysis." });
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
    getUserThreats
};
