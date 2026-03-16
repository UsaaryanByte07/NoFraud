// ===== Threat Detector (Content Script) =====

function detectThreats() {
    const currentUrl = window.location.href;
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // 1. Ask background.js to check URL via Google Safe Browsing API
    chrome.runtime.sendMessage(
        { action: "checkURLThreats", url: currentUrl },
        (response) => {
            if (chrome.runtime.lastError) {
                console.log("NoFraud: Background script unavailable.");
                return;
            }

            if (response && response.isThreat) {
                const label = response.type.replace(/_/g, " ");
                showThreatAlert("CRITICAL: " + label + " — Leave this site immediately!", "#dc2626");
                return;
            }

            // 2. Local heuristic checks
            const phishingKeywords = [
                "login-verify", "secure-update", "bank-verification",
                "account-reset", "confirm-password", "verify-identity",
                "paypal-secure", "apple-id-verify", "signin-alert"
            ];

            const isPhishing = phishingKeywords.some(kw => hostname.includes(kw));
            if (isPhishing) {
                showThreatAlert("HIGH RISK: Suspicious phishing domain detected.", "#dc2626");
            }

            // 3. HTTP warning (skip localhost)
            const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
            if (protocol === "http:" && !isLocal) {
                showThreatAlert("MODERATE RISK: This site uses an unsecured HTTP connection.", "#f59e0b");
            }
        }
    );
}

// ===== On-Page Alert Banner =====
function showThreatAlert(message, bgColor = "#dc2626") {
    // Prevent duplicate alerts
    if (document.getElementById("nofraud-alert-" + bgColor)) return;

    const alertBox = document.createElement("div");
    alertBox.id = "nofraud-alert-" + bgColor;
    alertBox.innerText = "⚠ NoFraud: " + message;

    Object.assign(alertBox.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        padding: "12px 20px",
        background: bgColor,
        color: "#ffffff",
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        fontSize: "14px",
        fontWeight: "600",
        textAlign: "center",
        zIndex: "2147483647",
        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        transition: "opacity 0.3s ease"
    });

    document.body.appendChild(alertBox);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        alertBox.style.opacity = "0";
        setTimeout(() => alertBox.remove(), 300);
    }, 8000);
}