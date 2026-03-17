// ===== Content Script — Entry Point =====

// Run scans immediately when the script is injected
detectThreats();
blurSensitiveData();
blockAds();

// Also listen for manual triggers or SPA navigations from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanPage") {
        detectThreats();
        blurSensitiveData();
        blockAds();
    }
});