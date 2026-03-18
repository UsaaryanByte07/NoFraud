const axios = require('axios');
const FormData = require('form-data');

const getVtHeaders = () => ({
    'x-apikey': process.env.VIRUSTOTAL_API_KEY
});


const uploadFileToVT = async (fileBuffer, filename) => {
    try {
        const form = new FormData();
        
        form.append('file', fileBuffer, { filename });

        const response = await axios.post(
            'https://www.virustotal.com/api/v3/files',
            form,
            {
                headers: {
                    ...getVtHeaders(),
                    ...form.getHeaders()
                }
            }
        );
        
        
        return response.data.data.id;
    } catch (error) {
        
        throw new Error("Failed to upload file to VirusTotal.");
    }
};


const pollVTReport = async (analysisId) => {
    const url = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;
    
    
    const MAX_RETRIES = 40;
    const POLLING_INTERVAL_MS = 3000;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await axios.get(url, { headers: getVtHeaders() });
            const status = response.data.data.attributes.status;

            if (status === 'completed') {
                const stats = response.data.data.attributes.stats;
                
                return stats;
            }

            
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
        } catch (error) {
            
            throw new Error("Failed to retrieve VirusTotal report.");
        }
    }

    throw new Error("VirusTotal scan timed out.");
};

module.exports = {
    uploadFileToVT,
    pollVTReport
};
