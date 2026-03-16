// ===== Content Script — Entry Point =====

// Run scans when background.js sends a message on page load
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanPage") {
        detectThreats();
        blurSensitiveData();
        blockAds();
    }
});