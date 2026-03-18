

function runShields() {
    chrome.storage.local.get([
        "extensionEnabled", 
        "threatEnabled", 
        "passwordBlurEnabled",
        "emailBlurEnabled", 
        "adBlockEnabled"
    ], (data) => {
        
        if (data.extensionEnabled === false) return;

        
        if (data.threatEnabled !== false) detectThreats();
        if (data.passwordBlurEnabled !== false) blurPasswords();
        if (data.emailBlurEnabled !== false) blurEmails();
        if (data.adBlockEnabled !== false) blockAds();
    });
}


runShields();


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanPage") {
        runShields();
    }
});