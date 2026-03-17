const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini models to try in order if one fails
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

// Helper: detect if string is a URL
const isValidUrl = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

// Helper: detect if string is an Email
const isValidEmail = (string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(string);
};

// Gemini LLM Analysis (handles URLs, emails, and plain text)
const checkWithGemini = async (content, type) => {
    const prompt = `
        You are an expert cybersecurity platform named "NoFraud" analyzing user input to detect scams, phishing, and fraud.
        A user has submitted the following ${type}:
        
        "${content}"
        
        Analyze it for potential fraud, phishing, scam tactics (urgency, asking for credentials, suspicious links, spoofed domains, unknown senders, bad grammar, misleading offers, etc).
        
        Return ONLY a JSON object with three keys:
        1. "isFraud": a boolean (true if highly suspicious, false if it seems safe)
        2. "explanation": a concise string explaining WHY it is or isn't fraud. Keep it under 2 sentences, written directly to the user.
        3. "nextSteps": an array of short, actionable strings (max 4 items) the user should take RIGHT NOW if isFraud is true (e.g., "Do not click any links", "Report to your bank"). If isFraud is false, return an empty array [].

        Do NOT wrap the response in markdown blocks like \`\`\`json. Just return the raw JSON string.
    `;

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().trim();

            try {
                const parsed = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());
                return {
                    isFraud: parsed.isFraud === true,
                    explanation: parsed.explanation || "Analyzed via AI.",
                    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : []
                };
            } catch (parseError) {
                console.error("Gemini JSON Parse Error:", responseText);
                return { isFraud: false, explanation: "Could not decisively analyze the content." };
            }
        } catch (error) {
            if (error.message && error.message.includes("429")) {
                console.warn(`Model ${modelName} quota exceeded, trying next model...`);
                continue;
            }
            console.error("Gemini API Error:", error.message);
            return { isFraud: null, explanation: "AI analysis failed." };
        }
    }

    console.error("All Gemini models quota exceeded.");
    return { isFraud: null, explanation: "AI quota exhausted. Please try again in a few minutes." };
};

// Main Exported Function
const analyzeContent = async (content) => {
    let inputType = "text";
    if (isValidUrl(content)) inputType = "url";
    else if (isValidEmail(content)) inputType = "email";

    const aiResult = await checkWithGemini(content, inputType);

    return {
        inputType,
        isFraud: aiResult.isFraud === true,
        explanation: aiResult.explanation || "Content appears safe.",
        nextSteps: aiResult.nextSteps || []
    };
};

const { uploadFileToVT, pollVTReport } = require('./virusTotalAnalyzer');
const { analyzeMediaDeepfake } = require('./sightengineAnalyzer');

const analyzeFile = async (fileBuffer, filename, mimeType) => {
    try {
        const isMedia = mimeType.startsWith('image/') || mimeType.startsWith('video/');
        let vtStats = null;
        let deepfakeInfo = null;
        let filePrompt = '';

        if (isMedia) {
            // Route media to Sightengine
            console.log(`[analyzeFile] Uploading media ${filename} to Sightengine for Deepfake analysis...`);
            deepfakeInfo = await analyzeMediaDeepfake(fileBuffer, filename, mimeType);
            
            // Convert probability to percentage for Gemini context
            const fakePercentage = (deepfakeInfo.deepfakeScore * 100).toFixed(1);
            
            filePrompt = `
                You are an expert cybersecurity platform named "NoFraud". A user uploaded a media file for analysis.
                
                File Name: "${filename}"
                MIME Type: "${mimeType}"
                
                We passed this file through a specialized AI Detection and Deepfake Engine.
                The engine returned an "AI Generated Probability" score of ${fakePercentage}%.
                (0% means authentic/human-made. 100% means definitely an AI deepfake).
                
                Analyze if this media is likely a deepfake or AI-generated manipulation.
                
                Return ONLY a JSON object with three keys:
                1. "isFraud": boolean (true if the percentage is > 50%, false if < 50%)
                2. "explanation": A concise string explaining the result directly to the user (e.g. "This image appears to be 98% AI-generated and is likely a deepfake.")
                3. "nextSteps": An array of short actionable strings if it is a deepfake (e.g. "Do not trust the content of this video"). Empty array [] if authentic.
            `;
        } else {
            // Route documents/exes to VirusTotal
            console.log(`[analyzeFile] Uploading ${filename} to VirusTotal...`);
            const vtAnalysisId = await uploadFileToVT(fileBuffer, filename);
            
            console.log(`[analyzeFile] Polling VT Report for ID: ${vtAnalysisId}...`);
            vtStats = await pollVTReport(vtAnalysisId);
            console.log(`[analyzeFile] VT Stats received:`, vtStats);

            const statsString = JSON.stringify(vtStats);
            
            filePrompt = `
                You are an expert cybersecurity platform named "NoFraud" analyzing a user-uploaded file to detect scams, malware, and fraud.
                
                File Name: "${filename}"
                MIME Type: "${mimeType}"
                
                We scanned this file with VirusTotal and received the following threat engine statistics:
                ${statsString}
                
                (Note: "malicious" means antivirus engines flagged it as a virus. "suspicious" means it shows red flags).

                Based on the filename, type, and VirusTotal results, analyze if this file is malicious/fraudulent.
                
                Return ONLY a JSON object with three keys:
                1. "isFraud": a boolean (true if highly suspicious or malicious, false if safe)
                2. "explanation": a concise string explaining WHY it is or isn't fraud based on the VT stats and filename.
                3. "nextSteps": an array of short, actionable strings if isFraud is true. Empty array [] if false.
            `;
        }

        let aiResult = { isFraud: null, explanation: "AI analysis failed.", nextSteps: [] };
        
        for (const modelName of MODELS) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(filePrompt);
                const responseText = result.response.text().trim();
    
                const parsed = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());
                aiResult = {
                    isFraud: parsed.isFraud === true,
                    explanation: parsed.explanation || "Analyzed via AI.",
                    nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : []
                };
                break; // success, exit loop
            } catch (err) {
                if (err.message && err.message.includes("429")) continue;
                console.error("Gemini File Parse Error:", err.message);
            }
        }

        return {
            inputType: isMedia ? (mimeType.startsWith('video/') ? "video" : "image") : "file",
            isFraud: aiResult.isFraud === true,
            explanation: aiResult.explanation || "Analysis completed.",
            nextSteps: aiResult.nextSteps || [],
            vtStats: vtStats,          // null if it was media
            deepfakeInfo: deepfakeInfo // null if it was a standard document/exe
        };

    } catch (error) {
        console.error("File Analysis Error:", error);
        return {
            inputType: mimeType.startsWith('image/') ? 'image' : (mimeType.startsWith('video/') ? 'video' : 'file'),
            isFraud: false,
            explanation: "Failed to analyze file. " + error.message,
            nextSteps: []
        };
    }
};

module.exports = { analyzeContent, analyzeFile };
