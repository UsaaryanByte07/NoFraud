

const GOOGLE_SAFE_BROWSING_API_KEY = "AIzaSyCopSKz5YPxPsd1G7NvoqPFlVRguOhzSck";


chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.storage.local.get("extensionEnabled", (data) => {
        if (data.extensionEnabled === false) return;
        
        chrome.tabs.sendMessage(details.tabId, { action: "scanPage" }).catch(() => {
            
        });
    });
});


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
            
            sendResponse({ isThreat: false });
        });

        
        return true;
    }

    
    if (message.action === "verifyEmail") {
        const emailToCheck = message.email;
        const result = { deliverable: null, disposable: null, validFormat: null, apiReached: false };

        
        fetch(`https://api.eva.pingutil.com/email?email=${encodeURIComponent(emailToCheck)}`)
            .then(res => res.json())
            .then(data => {
                result.apiReached = true;
                if (data.status === "success" && data.data) {
                    result.deliverable = data.data.deliverable;
                    result.disposable = data.data.disposable;
                    result.validFormat = data.data.valid_syntax;
                }
            })
            .catch(() => {
                
            })
            .finally(() => {
                
                fetch(`https://disposable.debounce.io/?email=${encodeURIComponent(emailToCheck)}`)
                    .then(res => res.json())
                    .then(debounceData => {
                        if (debounceData.disposable === "true") {
                            result.disposable = true;
                        }
                        result.apiReached = true;
                    })
                    .catch(() => {})
                    .finally(() => {
                        sendResponse(result);
                    });
            });

        return true;
    }

    
    if (message.action === "checkBreach") {
        const emailToCheck = message.email;
        const [localPart, domain] = emailToCheck.split("@");

        
        
        
        

        const massiveProviders = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com"];

        if (massiveProviders.includes(domain)) {
            
            
            sendResponse({ breached: false, breaches: [] });
            return true;
        }

        fetch(`https://haveibeenpwned.com/api/v3/breaches?domain=${encodeURIComponent(domain)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const breachNames = data.map(b => b.Name);
                    sendResponse({ breached: true, breaches: breachNames });
                } else {
                    sendResponse({ breached: false, breaches: [] });
                }
            })
            .catch(err => {
                
                sendResponse({ breached: false, breaches: [] });
            });

        return true;
    }
});