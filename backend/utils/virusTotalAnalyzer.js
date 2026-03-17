const axios = require('axios');
const FormData = require('form-data');

const getVtHeaders = () => ({
    'x-apikey': process.env.VIRUSTOTAL_API_KEY
});

/**
 * Uploads a file buffer to VirusTotal for analysis.
 * @param {Buffer} fileBuffer The file content
 * @param {string} filename The original filename
 * @returns {Promise<string>} The analysis ID to poll
 */
const uploadFileToVT = async (fileBuffer, filename) => {
    try {
        const form = new FormData();
        // form-data requires a filename when appending a buffer
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
        
        // Returns an ID like 'YWFhYmJi...:1234567890'
        return response.data.data.id;
    } catch (error) {
        console.error("VT Upload Error:", error.response?.data || error.message);
        throw new Error("Failed to upload file to VirusTotal.");
    }
};

/**
 * Polls the VirusTotal analysis endpoint until the scan completes.
 * @param {string} analysisId The ID returned from uploadFileToVT
 * @returns {Promise<Object>} Specific threat statistics
 */
const pollVTReport = async (analysisId) => {
    const url = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;
    
    // Poll up to 40 times, waiting 3 seconds between each (max ~2 minutes)
    const MAX_RETRIES = 40;
    const POLLING_INTERVAL_MS = 3000;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await axios.get(url, { headers: getVtHeaders() });
            const status = response.data.data.attributes.status;

            if (status === 'completed') {
                const stats = response.data.data.attributes.stats;
                // stats looks like: { malicious: 2, suspicious: 1, undetected: 65, harmless: 0, ... }
                return stats;
            }

            // If "queued" or "in-progress", wait and try again
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
        } catch (error) {
            console.error("VT Polling Error:", error.response?.data || error.message);
            throw new Error("Failed to retrieve VirusTotal report.");
        }
    }

    throw new Error("VirusTotal scan timed out.");
};

module.exports = {
    uploadFileToVT,
    pollVTReport
};
