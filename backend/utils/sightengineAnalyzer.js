const axios = require('axios');
const FormData = require('form-data');


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

        
        const endpoint = isVideo 
            ? 'https://api.sightengine.com/1.0/video/check-sync.json'
            : 'https://api.sightengine.com/1.0/check.json';

        
        
        const response = await axios.post(endpoint, data, {
            headers: {
                ...data.getHeaders()
            },
            
            timeout: isVideo ? 120000 : 30000 
        });

        const result = response.data;
        
        

        if (result.status !== 'success') {
            
            throw new Error('Sightengine API call failed or returned an error status.');
        }

        let deepfakeScore = 0;

        if (isImage) {
            
            
            deepfakeScore = result.type && result.type.deepfake ? result.type.deepfake : 0;
            
        } else {
            
            
            
            if (result.data && result.data.frames) {
                const maxScore = result.data.frames.reduce((highest, frame) => {
                    const score = frame.type && frame.type.deepfake ? frame.type.deepfake : 0;
                    return Math.max(highest, score);
                }, 0);
                deepfakeScore = maxScore;
                
            }
        }

        return {
            deepfakeScore: deepfakeScore, 
            isVideo: isVideo
        };

    } catch (error) {
        
        throw error;
    }
};

module.exports = {
    analyzeMediaDeepfake
};
