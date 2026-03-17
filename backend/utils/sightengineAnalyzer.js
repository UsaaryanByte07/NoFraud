const axios = require('axios');
const FormData = require('form-data');

/**
 * Analyzes an image or video buffer using Sightengine's Deepfake detection models.
 * @param {Buffer} fileBuffer - The memory buffer of the uploaded file.
 * @param {string} filename - The original name of the file
 * @param {string} mimeType - The mimetype (e.g., 'image/png' or 'video/mp4')
 * @returns {Promise<Object>} An object containing { deepfakeScore: Number, isVideo: Boolean }
 */
const analyzeMediaDeepfake = async (fileBuffer, filename, mimeType) => {
    try {
        const isVideo = mimeType.startsWith('video/');
        const isImage = mimeType.startsWith('image/');
        
        if (!isVideo && !isImage) {
            throw new Error(`Unsupported media type for Deepfake analysis: ${mimeType}`);
        }

        const data = new FormData();
        data.append('media', fileBuffer, {
            filename: filename,
            contentType: mimeType
        });
        
        data.append('models', 'deepfake');
        data.append('api_user', process.env.SIGHTENGINE_API_USER);
        data.append('api_secret', process.env.SIGHTENGINE_API_SECRET || process.env.SIGHTENGINE_API_KEY);

        // Sightengine has different endpoints for synchronous image check vs video check
        const endpoint = isVideo 
            ? 'https://api.sightengine.com/1.0/video/check-sync.json'
            : 'https://api.sightengine.com/1.0/check.json';

        console.log(`[Sightengine] Analyzing ${isVideo ? 'video' : 'image'} deepfake...`);
        
        const response = await axios.post(endpoint, data, {
            headers: {
                ...data.getHeaders()
            },
            // Increase timeout for video processing
            timeout: isVideo ? 120000 : 30000 
        });

        const result = response.data;
        
        console.log('[Sightengine] RAW API RESPONSE:', JSON.stringify(result, null, 2));

        if (result.status !== 'success') {
            console.error('[Sightengine] API Error:', result);
            throw new Error('Sightengine API call failed or returned an error status.');
        }

        let deepfakeScore = 0;

        if (isImage) {
            // Image Response Format
            // result.type.deepfake is the probability score (0.0 to 1.0)
            deepfakeScore = result.type && result.type.deepfake ? result.type.deepfake : 0;
            console.log(`[Sightengine] Image AI Generation Score: ${deepfakeScore}`);
        } else {
            // Video Response Format
            // Video returns a 'data.frames' array where each frame has 'type.deepfake'
            // We'll take the maximum deepfake score seen across all analyzed frames to be safe
            if (result.data && result.data.frames) {
                const maxScore = result.data.frames.reduce((highest, frame) => {
                    const score = frame.type && frame.type.deepfake ? frame.type.deepfake : 0;
                    return Math.max(highest, score);
                }, 0);
                deepfakeScore = maxScore;
                console.log(`[Sightengine] Video Max AI Generation Score: ${deepfakeScore}`);
            }
        }

        return {
            deepfakeScore: deepfakeScore, // Float between 0.0 and 1.0
            isVideo: isVideo
        };

    } catch (error) {
        console.error('[Sightengine] Error analyzing media:', error.message);
        throw error;
    }
};

module.exports = {
    analyzeMediaDeepfake
};
