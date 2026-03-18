const Threat = require('../models/Threat');
const { analyzeContent, analyzeFile } = require('../utils/fraudDetector');


const requireAuth = (req, res, next) => {
    
    if (!req.session || !req.session.user) {
        
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
    }
    next();
};




const analyzeThreat = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.user._id;
        

        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required for analysis." });
        }

        
        
        const analysisResult = await analyzeContent(content);
        

        if (analysisResult.error) {
            return res.status(400).json({ success: false, message: analysisResult.explanation });
        }

        
        const newThreat = await Threat.create({
            user: userId,
            inputType: analysisResult.inputType,
            content: content,
            isFraud: analysisResult.isFraud === true, 
            explanation: analysisResult.explanation || 'Analysis complete.',
            nextSteps: analysisResult.nextSteps || []
        });

        
        res.status(200).json({
            success: true,
            data: {
                _id: newThreat._id,
                inputType: newThreat.inputType,
                content: newThreat.content,
                isFraud: newThreat.isFraud,
                explanation: newThreat.explanation,
                nextSteps: newThreat.nextSteps,
                createdAt: newThreat.createdAt
            }
        });

    } catch (error) {
        
        res.status(500).json({ success: false, message: "Server error during threat analysis." });
    }
};




const analyzeFileThreat = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.session.user._id;

        if (!file) {
            return res.status(400).json({ success: false, message: "No file uploaded for analysis." });
        }

        

        
        const analysisResult = await analyzeFile(file.buffer, file.originalname, file.mimetype);
        

        if (analysisResult.error) {
            return res.status(400).json({ success: false, message: analysisResult.explanation });
        }

        
        const newThreat = await Threat.create({
            user: userId,
            inputType: analysisResult.inputType,
            content: `[FILE] ${file.originalname}`,
            isFraud: analysisResult.isFraud === true,
            explanation: analysisResult.explanation || 'Analysis complete.',
            nextSteps: analysisResult.nextSteps || []
        });

        
        res.status(200).json({
            success: true,
            data: {
                _id: newThreat._id,
                inputType: newThreat.inputType,
                content: newThreat.content,
                isFraud: newThreat.isFraud,
                explanation: newThreat.explanation,
                nextSteps: newThreat.nextSteps,
                vtStats: analysisResult.vtStats || null,
                createdAt: newThreat.createdAt
            }
        });

    } catch (error) {
        
        res.status(500).json({ success: false, message: "Server error during file analysis." });
    }
};




const getUserThreats = async (req, res) => {
    try {
        const userId = req.session.user._id;

        
        const threats = await Threat.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: threats.length,
            data: threats
        });

    } catch (error) {
        
        res.status(500).json({ success: false, message: "Server error fetching threat history." });
    }
};

module.exports = {
    requireAuth,
    analyzeThreat,
    analyzeFileThreat,
    getUserThreats
};
