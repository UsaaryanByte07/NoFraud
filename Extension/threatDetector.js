function detectThreats() {

    let url = window.location.href;

    let suspiciousKeywords = [
        "login-verify",
        "secure-update",
        "bank-verification",
        "account-reset",
        "confirm-password"
    ];

    suspiciousKeywords.forEach(keyword => {

        if (url.includes(keyword)) {
            showThreatAlert("Hidden phishing detected");
        }

    });

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