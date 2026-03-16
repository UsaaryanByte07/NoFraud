function detectThreats() {
    let currentUrl = window.location.href;

    // Contact the background script to check the URL against a Real-time Threat API
    chrome.runtime.sendMessage(
        { action: "checkURLThreats", url: currentUrl },
        (response) => {
            if (chrome.runtime.lastError) {
                console.log("NoFraud: Could not contact background script.");
                return;
            }

            if (response && response.isThreat) {
                showThreatAlert("MALWARE DETECTED: This site is verified as malicious! (" + response.type + ")");
            }
            
            // We can also keep a small local heuristic scan for common tricky signs as a backup:
            let hostname = window.location.hostname;
            let suspiciousKeywords = ["login-verify", "secure-update", "bank-verification"];
            suspiciousKeywords.forEach(keyword => {
                if (hostname.includes(keyword)) {
                    showThreatAlert("Suspicious domain name detected (Phishing Keyword)");
                }
            });
        }
    );
}

function showThreatAlert(message) {

    let alertBox = document.createElement("div");

    alertBox.innerText = "⚠ NoFraud Threat Alert: " + message;

    alertBox.style.position = "fixed";
    alertBox.style.top = "10px";
    alertBox.style.right = "10px";
    alertBox.style.background = "red";
    alertBox.style.color = "white";
    alertBox.style.padding = "10px";
    alertBox.style.zIndex = "9999";

    document.body.appendChild(alertBox);

}