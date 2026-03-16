chrome.webNavigation.onCompleted.addListener((details) => {

    chrome.tabs.sendMessage(details.tabId, {
        action: "scanPage"
    });

});