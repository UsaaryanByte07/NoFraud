chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "scanPage") {

        detectThreats();
        blurSensitiveData();
        blockAds();

    }

});