// ===== Content Script — Entry Point =====

function runShields() {
    chrome.storage.local.get([
        "extensionEnabled", 
        "threatEnabled", 
        "passwordBlurEnabled",
        "emailBlurEnabled", 
        "adBlockEnabled"
    ], (data) => {
        // If extension is disabled globally, don't run anything
        if (data.extensionEnabled === false) return;

        // Run enabled shields
        if (data.threatEnabled !== false) detectThreats();
        if (data.passwordBlurEnabled !== false) blurPasswords();
        if (data.emailBlurEnabled !== false) blurEmails();
        if (data.adBlockEnabled !== false) blockAds();
    });
}

// Run scans immediately when the script is injected
runShields();

// Also listen for manual triggers or SPA navigations from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanPage") {
        runShields();
    }
});