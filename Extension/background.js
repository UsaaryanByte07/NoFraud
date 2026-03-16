// ===== Google Safe Browsing API Key =====
// Replace "YOUR_API_KEY_HERE" with your actual Google Safe Browsing API key
const GOOGLE_SAFE_BROWSING_API_KEY = "YOUR_API_KEY_HERE";

// ===== Auto-scan pages on load =====
chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.tabs.sendMessage(details.tabId, { action: "scanPage" }).catch(() => {
        // Tab may not have a content script ready yet — safe to ignore
    });
});

// ===== API Bridge for Threat Detection =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkURLThreats") {

        const urlToCheck = message.url;
        const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`;

        const payload = {
            client: {
                clientId: "nofraud-extension",
                clientVersion: "1.0.0"
            },
            threatInfo: {
                threatTypes: [
                    "MALWARE",
                    "SOCIAL_ENGINEERING",
                    "UNWANTED_SOFTWARE",
                    "POTENTIALLY_HARMFUL_APPLICATION"
                ],
                platformTypes: ["ANY_PLATFORM"],
                threatEntryTypes: ["URL"],
                threatEntries: [{ url: urlToCheck }]
            }
        };

        fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Content-Type": "application/json" }
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.matches && data.matches.length > 0) {
                const threatType = data.matches[0].threatType;
                sendResponse({ isThreat: true, type: threatType });
            } else {
                sendResponse({ isThreat: false });
            }
        })
        .catch(err => {
            console.error("NoFraud: Google API error", err);
            sendResponse({ isThreat: false });
        });

        // Keep the message channel open for the async response
        return true;
    }
});