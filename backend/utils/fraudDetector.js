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
        
        Return ONLY a JSON object with two keys:
        1. "isFraud": a boolean (true if highly suspicious, false if it seems safe)
        2. "explanation": a concise string explaining WHY it is or isn't fraud. Keep it under 2 sentences, written directly to the user (e.g., "This text is suspicious because...").

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
                    explanation: parsed.explanation || "Analyzed via AI."
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
        explanation: aiResult.explanation || "Content appears safe."
    };
};

module.exports = { analyzeContent };
