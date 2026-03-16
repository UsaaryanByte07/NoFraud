chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.tabs.sendMessage(details.tabId, {
        action: "scanPage"
    });
});

// Background scripts are allowed to make cross-origin requests (CORS) freely.
// This acts as the API bridge for real threat detection!
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkURLThreats") {
        
        let urlToCheck = message.url;

        // Query an actual Malware database API (URLhaus by abuse.ch)
        let formData = new URLSearchParams();
        formData.append('url', urlToCheck);

        fetch("https://urlhaus-api.abuse.ch/v1/url/", {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.query_status === "ok" && data.url_status === "online") {
                sendResponse({ isThreat: true, type: "Malware Distribution Site" });
            } else {
                sendResponse({ isThreat: false });
            }
        })
        .catch(error => {
            console.error("API error", error);
            sendResponse({ isThreat: false }); // Fallback on error
        });

        // Returning true tells Chrome we will send the response asynchronously
        return true; 
    }
});