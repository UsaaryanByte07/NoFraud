// ===== Email Scanner =====
document.getElementById("scanMail").addEventListener("click", async () => {
    const email = document.getElementById("emailCheck").value.trim();
    const resultEl = document.getElementById("mailResult");

    if (!email) {
        resultEl.innerText = "Please enter an email address.";
        resultEl.style.color = "#fb923c";
        return;
    }

    resultEl.innerText = "Scanning...";
    resultEl.style.color = "#38bdf8";

    try {
        const response = await fetch(`https://disposable.debounce.io/?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (data.disposable === "true") {
            resultEl.innerText = "⚠ High Risk — Disposable/Fake Email";
            resultEl.style.color = "#ef4444";
        } else {
            resultEl.innerText = "✅ Safe — Legitimate Email";
            resultEl.style.color = "#22c55e";
        }
    } catch (err) {
        resultEl.innerText = "⚠ Could not reach email API.";
        resultEl.style.color = "#fb923c";
    }
});

// ===== Musoku Mode =====
document.getElementById("musokuToggle").addEventListener("click", () => {
    alert("Musoku Mode Activated: Minimal Trace Browsing Enabled");
});

// ===== Auto Threat Scan on Popup Open =====
document.addEventListener("DOMContentLoaded", () => {
    const threatStatusEl = document.getElementById("threatStatus");
    const severityEl = document.getElementById("severity");

    // Helper to update both badges
    function setStatus(statusText, statusClass, severityText, severityClass) {
        threatStatusEl.innerText = statusText;
        threatStatusEl.className = "status-badge " + statusClass;

        severityEl.innerText = severityText;
        severityEl.className = "risk-badge " + severityClass;
    }

    // Start scanning
    setStatus("Scanning...", "scanning", "Analyzing...", "analyzing");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
            setStatus("No tab found", "moderate", "Unknown", "moderate");
            return;
        }

        const currentUrl = tabs[0].url;

        // Skip browser internal pages
        if (currentUrl.startsWith("chrome://") || currentUrl.startsWith("edge://") || currentUrl.startsWith("about:") || currentUrl.startsWith("chrome-extension://")) {
            setStatus("System Page", "safe", "No Risk", "safe");
            return;
        }

        // Send the URL to background.js for Google Safe Browsing check
        chrome.runtime.sendMessage(
            { action: "checkURLThreats", url: currentUrl },
            (response) => {
                if (chrome.runtime.lastError) {
                    setStatus("Scan Unavailable", "moderate", "Unknown", "moderate");
                    return;
                }

                if (response && response.isThreat) {
                    // Google confirmed the site as dangerous
                    let threatLabel = response.type.replace(/_/g, " ");
                    setStatus("🚨 " + threatLabel, "critical", "Critical", "critical");
                    return;
                }

                // No API threat found — run local heuristic checks
                try {
                    const urlObj = new URL(currentUrl);
                    const hostname = urlObj.hostname;
                    const protocol = urlObj.protocol;

                    // Check for phishing keywords in the hostname
                    const phishingKeywords = [
                        "login-verify", "secure-update", "bank-verification",
                        "account-reset", "confirm-password", "verify-identity",
                        "paypal-secure", "apple-id-verify", "signin-alert"
                    ];
                    const isPhishing = phishingKeywords.some(kw => hostname.includes(kw));

                    if (isPhishing) {
                        setStatus("Phishing Suspected", "high", "High Risk", "high");
                        return;
                    }

                    // Check for HTTP (not HTTPS) — unsecured connection
                    const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
                    if (protocol === "http:" && !isLocalhost) {
                        setStatus("Unsecured (HTTP)", "moderate", "Moderate Risk", "moderate");
                        return;
                    }

                    // Everything passed — site is safe
                    setStatus("Secure", "safe", "Low Risk", "safe");

                } catch (e) {
                    setStatus("Secure", "safe", "Low Risk", "safe");
                }
            }
        );
    });
});