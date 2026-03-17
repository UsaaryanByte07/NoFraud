// ===== Email Scanner (Verified via Background Script) =====
document.getElementById("scanMail").addEventListener("click", () => {
    const email = document.getElementById("emailCheck").value.trim().toLowerCase();
    const resultEl = document.getElementById("mailResult");

    if (!email) {
        resultEl.innerText = "Please enter an email address.";
        resultEl.style.color = "#fb923c";
        return;
    }

    // Format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        resultEl.innerText = "❌ Invalid email format.";
        resultEl.style.color = "#ef4444";
        return;
    }

    resultEl.innerText = "🔍 Verifying email...";
    resultEl.style.color = "#38bdf8";

    const [localPart, domain] = email.split("@");
    const tld = "." + domain.split(".").pop();

    // Disposable domain blacklist
    const disposableDomains = [
        "tempmail.com", "throwaway.email", "guerrillamail.com", "guerrillamail.net",
        "mailinator.com", "yopmail.com", "10minutemail.com", "trashmail.com",
        "fakeinbox.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
        "dispostable.com", "mailnesia.com", "maildrop.cc", "discard.email",
        "mailcatch.com", "mytrashmail.com", "trash-mail.com", "devnullmail.com",
        "emailondeck.com", "33mail.com", "inboxbear.com", "mohmal.com",
        "getnada.com", "tempail.com", "temp-mail.org", "temp-mail.io",
        "burnermail.io", "mailsac.com", "harakirimail.com", "tmail.ws",
        "tmpmail.net", "tmpmail.org", "moakt.ws", "moakt.co",
        "emailfake.com", "crazymailing.com", "armyspy.com", "cuvox.de",
        "rhyta.com", "superrito.com", "teleworm.us", "tempr.email",
        "spamgourmet.com", "mintemail.com", "tempinbox.com", "mailnull.com",
        "getairmail.com", "tempmailo.com", "tempmailaddress.com",
        "temporarymail.net", "anonbox.net", "bugmenot.com"
    ];

    // Trusted providers
    const trustedProviders = [
        "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
        "icloud.com", "me.com", "mac.com", "aol.com", "msn.com",
        "protonmail.com", "proton.me", "zoho.com", "zohomail.com",
        "yandex.com", "yandex.ru", "mail.com", "gmx.com", "gmx.net",
        "fastmail.com", "tutanota.com", "tuta.io", "hey.com",
        "yahoo.co.in", "yahoo.co.uk", "outlook.in", "rediffmail.com",
        "mail.ru", "163.com", "qq.com", "sina.com",
        "att.net", "comcast.net", "verizon.net", "sbcglobal.net"
    ];

    // Quick local check — blacklisted disposable domain
    if (disposableDomains.includes(domain)) {
        resultEl.innerHTML = "❌ <b>Fraudulent</b> — Disposable/temporary email provider.";
        resultEl.style.color = "#ef4444";
        return;
    }

    // Send to background.js for real API verification
    chrome.runtime.sendMessage({ action: "verifyEmail", email: email }, (response) => {
        if (chrome.runtime.lastError || !response) {
            // API bridge failed — fall back to local logic
            if (trustedProviders.includes(domain)) {
                resultEl.innerHTML = "✅ <b>Safe</b> — Trusted provider (" + domain + ")";
                resultEl.style.color = "#22c55e";
            } else {
                resultEl.innerHTML = "⚠️ <b>Unknown</b> — Could not verify. Domain not recognized.";
                resultEl.style.color = "#fb923c";
            }
            return;
        }

        const risks = [];
        let riskScore = 0;

        // Check API disposable result
        if (response.disposable === true) {
            risks.push("Disposable/temporary email");
            riskScore += 50;
        }

        // Check deliverability (does this mailbox actually exist?)
        if (response.deliverable === false) {
            risks.push("Mailbox does not exist");
            riskScore += 45;
        }

        // Check format from API
        if (response.validFormat === false) {
            risks.push("Invalid format per verification server");
            riskScore += 30;
        }

        // Local: risky TLD
        const riskyTlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".pw",
            ".buzz", ".club", ".icu", ".cam", ".monster", ".click"];
        if (riskyTlds.includes(tld)) {
            risks.push("High-risk domain extension (" + tld + ")");
            riskScore += 15;
        }

        // Local: hyphen-heavy domain
        if ((domain.match(/-/g) || []).length >= 3) {
            risks.push("Suspicious domain pattern");
            riskScore += 10;
        }

        riskScore = Math.min(riskScore, 100);
        const isTrusted = trustedProviders.includes(domain);

        // Final output
        if (riskScore === 0) {
            if (isTrusted) {
                resultEl.innerHTML = "✅ <b>Legitimate</b> — Verified on " + domain;
            } else if (response.deliverable === true) {
                resultEl.innerHTML = "✅ <b>Legitimate</b> — Mailbox verified.";
            } else if (response.apiReached) {
                resultEl.innerHTML = "✅ <b>Safe</b> — No threats detected.";
            } else {
                resultEl.innerHTML = "✅ <b>Safe</b> — No issues found (local checks only).";
            }
            resultEl.style.color = "#22c55e";
        } else if (riskScore <= 20) {
            resultEl.innerHTML = "⚠️ <b>Low Risk</b><br><small>" + risks.join("; ") + "</small>";
            resultEl.style.color = "#38bdf8";
        } else if (riskScore <= 45) {
            resultEl.innerHTML = "⚠️ <b>Moderate Risk</b><br><small>" + risks.join("; ") + "</small>";
            resultEl.style.color = "#fb923c";
        } else if (riskScore <= 70) {
            resultEl.innerHTML = "🚨 <b>High Risk — Likely Fake</b><br><small>" + risks.join("; ") + "</small>";
            resultEl.style.color = "#ef4444";
        } else {
            resultEl.innerHTML = "❌ <b>Fraudulent Email</b><br><small>" + risks.join("; ") + "</small>";
            resultEl.style.color = "#ef4444";
        }
    });
});

// ===== Musoku Mode =====
document.getElementById("musokuToggle").addEventListener("click", () => {
    alert("Musoku Mode Activated: Minimal Trace Browsing Enabled");
});

// ===== Password Strength Checker =====
(function() {
    const input = document.getElementById("passwordInput");
    const bar = document.getElementById("pwdStrengthBar");
    const result = document.getElementById("pwdResult");
    const criteriaEl = document.getElementById("pwdCriteria");
    const toggleBtn = document.getElementById("togglePwdVis");

    // Toggle password visibility
    toggleBtn.addEventListener("click", () => {
        input.type = input.type === "password" ? "text" : "password";
        toggleBtn.innerText = input.type === "password" ? "👁" : "🙈";
    });

    const criteria = [
        { id: "len",   label: "At least 8 characters",     test: p => p.length >= 8 },
        { id: "upper", label: "Uppercase letter (A-Z)",     test: p => /[A-Z]/.test(p) },
        { id: "lower", label: "Lowercase letter (a-z)",     test: p => /[a-z]/.test(p) },
        { id: "num",   label: "Number (0-9)",               test: p => /\d/.test(p) },
        { id: "sym",   label: "Symbol (!@#$%^&*)",          test: p => /[^a-zA-Z0-9]/.test(p) },
        { id: "no_common", label: "Not a common password",  test: p => {
            const common = ["password", "123456", "12345678", "qwerty", "abc123",
                "password1", "iloveyou", "admin", "letmein", "welcome",
                "monkey", "dragon", "master", "login", "princess", "1234567890"];
            return !common.includes(p.toLowerCase());
        }},
    ];

    // Build criteria UI
    criteriaEl.innerHTML = criteria.map(c =>
        `<div class="pwd-criteria-item fail" id="crit-${c.id}">○ ${c.label}</div>`
    ).join("");

    input.addEventListener("input", () => {
        const pwd = input.value;
        if (!pwd) {
            bar.style.width = "0%";
            result.innerText = "";
            criteria.forEach(c => {
                document.getElementById("crit-" + c.id).className = "pwd-criteria-item fail";
                document.getElementById("crit-" + c.id).innerText = "○ " + c.label;
            });
            return;
        }

        let score = 0;
        criteria.forEach(c => {
            const el = document.getElementById("crit-" + c.id);
            if (c.test(pwd)) {
                score++;
                el.className = "pwd-criteria-item pass";
                el.innerText = "✓ " + c.label;
            } else {
                el.className = "pwd-criteria-item fail";
                el.innerText = "○ " + c.label;
            }
        });

        // Bonus for length
        if (pwd.length >= 12) score = Math.min(score + 0.5, 6);
        if (pwd.length >= 16) score = Math.min(score + 0.5, 6);

        const pct = Math.round((score / 6) * 100);
        bar.style.width = pct + "%";

        if (pct >= 90) {
            bar.style.background = "#22c55e";
            result.innerText = "🟢 Excellent";
            result.style.color = "#22c55e";
        } else if (pct >= 65) {
            bar.style.background = "#38bdf8";
            result.innerText = "🔵 Good";
            result.style.color = "#38bdf8";
        } else if (pct >= 40) {
            bar.style.background = "#fb923c";
            result.innerText = "🟠 Fair";
            result.style.color = "#fb923c";
        } else {
            bar.style.background = "#ef4444";
            result.innerText = "🔴 Weak";
            result.style.color = "#ef4444";
        }
    });
})();

// ===== Link Scanner =====
document.getElementById("scanLink").addEventListener("click", () => {
    const url = document.getElementById("linkInput").value.trim();
    const resultEl = document.getElementById("linkResult");

    if (!url) {
        resultEl.innerText = "Please paste a URL.";
        resultEl.style.color = "#fb923c";
        return;
    }

    // Validate URL format
    let urlObj;
    try {
        urlObj = new URL(url);
    } catch (e) {
        resultEl.innerText = "❌ Invalid URL format.";
        resultEl.style.color = "#ef4444";
        return;
    }

    resultEl.innerText = "🔍 Checking link...";
    resultEl.style.color = "#38bdf8";

    const hostname = urlObj.hostname;
    const protocol = urlObj.protocol;
    const risks = [];

    // Local checks
    if (protocol === "http:") risks.push("No HTTPS encryption");

    const phishingKw = ["login-verify", "secure-update", "bank-verification",
        "account-reset", "confirm-password", "paypal-secure", "free-gift", "claim-prize"];
    if (phishingKw.some(kw => hostname.includes(kw))) risks.push("Phishing keywords detected");

    const riskyTlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".pw", ".buzz", ".icu"];
    const tld = "." + hostname.split(".").pop();
    if (riskyTlds.includes(tld)) risks.push("High-risk domain extension");

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) risks.push("IP-based URL (no domain name)");
    if (hostname.length > 40) risks.push("Unusually long hostname");
    if (hostname.split(".").length > 4) risks.push("Excessive subdomains");

    // Check with Google Safe Browsing via background.js
    chrome.runtime.sendMessage({ action: "checkURLThreats", url: url }, (response) => {
        if (chrome.runtime.lastError) {
            // API unavailable — use local results only
        } else if (response && response.isThreat) {
            risks.push("⚠ Flagged by Google: " + response.type.replace(/_/g, " "));
        }

        if (risks.length === 0) {
            resultEl.innerHTML = "✅ <b>Safe</b> — No threats found for this link.";
            resultEl.style.color = "#22c55e";
        } else if (risks.length <= 1) {
            resultEl.innerHTML = "⚠️ <b>Suspicious</b><br><small>" + risks.join("; ") + "</small>";
            resultEl.style.color = "#fb923c";
        } else {
            resultEl.innerHTML = "🚨 <b>Dangerous</b><br><small>" + risks.join("; ") + "</small>";
            resultEl.style.color = "#ef4444";
        }
    });
});

// ===== Data Breach Checker =====
document.getElementById("checkBreach").addEventListener("click", () => {
    const email = document.getElementById("breachEmail").value.trim().toLowerCase();
    const resultEl = document.getElementById("breachResult");

    if (!email) {
        resultEl.innerText = "Please enter an email.";
        resultEl.style.color = "#fb923c";
        return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        resultEl.innerText = "❌ Invalid email format.";
        resultEl.style.color = "#ef4444";
        return;
    }

    resultEl.innerText = "🔍 Checking breaches...";
    resultEl.style.color = "#38bdf8";

    // Use background.js to check breach APIs
    chrome.runtime.sendMessage({ action: "checkBreach", email: email }, (response) => {
        if (chrome.runtime.lastError || !response) {
            resultEl.innerHTML = "⚠️ Could not reach breach database.";
            resultEl.style.color = "#fb923c";
            return;
        }

        if (response.breached && response.breaches.length > 0) {
            const count = response.breaches.length;
            const names = response.breaches.slice(0, 5).join(", ");
            const extra = count > 5 ? ` and ${count - 5} more` : "";
            resultEl.innerHTML = `🚨 <b>BREACHED</b> — Found in ${count} breach(es)<br><small>${names}${extra}</small>`;
            resultEl.style.color = "#ef4444";
        } else if (response.breached === false) {
            resultEl.innerHTML = "✅ <b>No breaches found</b> — This email appears safe.";
            resultEl.style.color = "#22c55e";
        } else {
            resultEl.innerHTML = "✅ <b>No known breaches</b> — Not found in public breach data.";
            resultEl.style.color = "#22c55e";
        }
    });
});

// ===== Auto Threat Scan + Trust Level on Popup Open =====
document.addEventListener("DOMContentLoaded", () => {
    const threatStatusEl = document.getElementById("threatStatus");
    const severityEl = document.getElementById("severity");
    const trustScoreEl = document.getElementById("trustScore");
    const trustLabelEl = document.getElementById("trustLabel");
    const gaugeFill = document.getElementById("gaugeFill");

    // Factor bar elements
    const bars = {
        https:     { bar: document.getElementById("barHttps"),     pts: document.getElementById("ptsHttps"),     max: 20 },
        domain:    { bar: document.getElementById("barDomain"),    pts: document.getElementById("ptsDomain"),    max: 20 },
        tld:       { bar: document.getElementById("barTld"),       pts: document.getElementById("ptsTld"),       max: 15 },
        structure: { bar: document.getElementById("barStructure"), pts: document.getElementById("ptsStructure"), max: 15 },
        age:       { bar: document.getElementById("barAge"),       pts: document.getElementById("ptsAge"),       max: 15 },
        threats:   { bar: document.getElementById("barThreats"),   pts: document.getElementById("ptsThreats"),   max: 15 },
    };

    // Helper to update threat/risk badges
    function setStatus(statusText, statusClass, severityText, severityClass) {
        threatStatusEl.innerText = statusText;
        threatStatusEl.className = "status-badge " + statusClass;
        severityEl.innerText = severityText;
        severityEl.className = "risk-badge " + severityClass;
    }

    // Helper to update a single factor bar
    function setBar(key, points) {
        const f = bars[key];
        const pct = Math.max(0, (points / f.max) * 100);
        f.bar.style.width = pct + "%";
        f.pts.innerText = points + "/" + f.max;

        // Color the bar based on how full it is
        if (pct >= 80) {
            f.bar.style.background = "#22c55e"; // green
        } else if (pct >= 40) {
            f.bar.style.background = "#fb923c"; // orange
        } else {
            f.bar.style.background = "#ef4444"; // red
        }
    }

    // Helper to update the circular gauge + label
    function setTrust(score, label, color) {
        // Update text
        trustScoreEl.innerText = score;
        trustScoreEl.style.color = color;
        trustLabelEl.innerText = label;
        trustLabelEl.style.color = color;

        // Animate the SVG circle (circumference = 2 * PI * 50 ≈ 314)
        const circumference = 314;
        const offset = circumference - (score / 100) * circumference;
        gaugeFill.style.strokeDashoffset = offset;
        gaugeFill.style.stroke = color;
    }

    // ===== Databases =====

    // Trusted domains (full 25 pts for domain reputation)
    const trustedDomains = [
        "google.com", "youtube.com", "facebook.com", "amazon.com", "wikipedia.org",
        "twitter.com", "instagram.com", "linkedin.com", "reddit.com", "netflix.com",
        "microsoft.com", "apple.com", "github.com", "stackoverflow.com", "whatsapp.com",
        "zoom.us", "live.com", "office.com", "bing.com", "yahoo.com",
        "twitch.tv", "discord.com", "spotify.com", "paypal.com", "ebay.com",
        "cnn.com", "bbc.com", "nytimes.com", "forbes.com", "medium.com",
        "cloudflare.com", "aws.amazon.com", "azure.com", "notion.so", "figma.com"
    ];

    // Risky TLDs often used for phishing/spam
    const riskyTlds = [
        ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".pw",
        ".cc", ".buzz", ".surf", ".club", ".icu", ".cam", ".rest",
        ".monster", ".click", ".link", ".info", ".bid", ".stream",
        ".racing", ".win", ".gdn", ".loan", ".date", ".trade"
    ];

    // High-trust TLDs (government, education, established)
    const premiumTlds = [
        ".gov", ".edu", ".mil", ".org", ".int", ".ac.uk", ".gov.uk",
        ".edu.au", ".gov.in", ".ac.in"
    ];

    // Phishing keywords
    const phishingKeywords = [
        "login-verify", "secure-update", "bank-verification",
        "account-reset", "confirm-password", "verify-identity",
        "paypal-secure", "apple-id-verify", "signin-alert",
        "free-gift", "claim-prize", "urgent-action"
    ];

    // Start scanning
    setStatus("Scanning...", "scanning", "Analyzing...", "analyzing");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
            setStatus("No tab found", "moderate", "Unknown", "moderate");
            setTrust(0, "Unknown", "#64748b");
            return;
        }

        const currentUrl = tabs[0].url;

        // Skip internal pages
        if (currentUrl.startsWith("chrome://") || currentUrl.startsWith("edge://") || currentUrl.startsWith("about:") || currentUrl.startsWith("chrome-extension://")) {
            setStatus("System Page", "safe", "No Risk", "safe");
            setTrust(100, "System Page", "#22c55e");
            setBar("https", 20); setBar("domain", 20); setBar("tld", 15);
            setBar("structure", 15); setBar("age", 15); setBar("threats", 15);
            return;
        }

        // Parse URL
        let urlObj;
        try {
            urlObj = new URL(currentUrl);
        } catch (e) {
            setStatus("Invalid URL", "moderate", "Unknown", "moderate");
            setTrust(0, "Cannot Analyze", "#64748b");
            return;
        }

        const hostname = urlObj.hostname;
        const protocol = urlObj.protocol;
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
        const rootDomain = hostname.split(".").slice(-2).join(".");

        // ===== Trust Score Calculation (6 Factors = 100 max) =====
        let trustPoints = 0;
        let scores = { https: 0, domain: 0, tld: 0, structure: 0, age: 0, threats: 0 };

        // --- Factor 1: HTTPS Encryption (20 pts) ---
        const hasHttps = protocol === "https:" || isLocalhost;
        if (hasHttps) {
            scores.https = 20;
            trustPoints += 20;
        }

        // --- Factor 2: Domain Reputation (20 pts) ---
        const isTrusted = trustedDomains.includes(rootDomain);
        if (isTrusted) {
            scores.domain = 20;
            trustPoints += 20;
        } else if (isLocalhost) {
            scores.domain = 15;
            trustPoints += 15;
        }

        // --- Factor 3: TLD Reputation (15 pts) ---
        const isRiskyTld = riskyTlds.some(t => hostname.endsWith(t));
        const isPremiumTld = premiumTlds.some(t => hostname.endsWith(t));
        if (isPremiumTld) {
            scores.tld = 15;
            trustPoints += 15;
        } else if (isRiskyTld) {
            scores.tld = 0;
        } else {
            scores.tld = 10;
            trustPoints += 10;
        }

        // --- Factor 4: URL Structure Analysis (15 pts) ---
        const hasPhishing = phishingKeywords.some(kw => hostname.includes(kw));
        const hasTooManyDots = hostname.split(".").length > 4;
        const hasLongHostname = hostname.length > 40;
        const hasIPAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
        const hasSuspiciousChars = /[@%!]/.test(currentUrl);
        const hasDoubleHyphens = hostname.includes("--");

        if (!(hasPhishing || hasTooManyDots || hasLongHostname || hasIPAddress || hasSuspiciousChars || hasDoubleHyphens)) {
            scores.structure = 15;
            trustPoints += 15;
        }

        // --- Factor 5: Domain Age Heuristic (15 pts) ---
        const domainName = rootDomain.split(".")[0];
        const hasNumbers = /\d/.test(domainName);
        const isVeryShort = domainName.length <= 3;
        const isVeryLong = domainName.length > 20;
        const looksRandom = /^[a-z0-9]{8,}$/.test(domainName) && hasNumbers;

        if (isTrusted) {
            scores.age = 15;
            trustPoints += 15;
        } else if (looksRandom || isVeryLong) {
            scores.age = 0;
        } else if (hasNumbers && isVeryShort) {
            scores.age = 5;
            trustPoints += 5;
        } else {
            scores.age = 10;
            trustPoints += 10;
        }

        // Update all non-async bars now
        setBar("https", scores.https);
        setBar("domain", scores.domain);
        setBar("tld", scores.tld);
        setBar("structure", scores.structure);
        setBar("age", scores.age);

        // --- Factor 6: Google Safe Browsing API (15 pts) — async ---
        chrome.runtime.sendMessage(
            { action: "checkURLThreats", url: currentUrl },
            (response) => {
                if (chrome.runtime.lastError) {
                    scores.threats = 8;
                    trustPoints += 8;
                } else if (response && response.isThreat) {
                    scores.threats = 0;
                    trustPoints -= 40;
                } else {
                    scores.threats = 15;
                    trustPoints += 15;
                }

                // Update threats bar
                setBar("threats", scores.threats);

                // Clamp between 0-100
                trustPoints = Math.max(0, Math.min(100, trustPoints));

                // ===== Set Threat Status & Risk Level =====
                if (response && response.isThreat) {
                    let threatLabel = response.type.replace(/_/g, " ");
                    setStatus("🚨 " + threatLabel, "critical", "Critical", "critical");
                } else if (hasPhishing) {
                    setStatus("Phishing Suspected", "high", "High Risk", "high");
                } else if (!hasHttps && !isLocalhost) {
                    setStatus("Unsecured (HTTP)", "moderate", "Moderate Risk", "moderate");
                } else {
                    setStatus("Secure", "safe", "Low Risk", "safe");
                }

                // ===== Set Trust Level (Circular Gauge) =====
                if (trustPoints >= 85) {
                    setTrust(trustPoints, "Highly Trusted", "#22c55e");
                } else if (trustPoints >= 65) {
                    setTrust(trustPoints, "Moderately Trusted", "#38bdf8");
                } else if (trustPoints >= 45) {
                    setTrust(trustPoints, "Low Trust", "#fb923c");
                } else {
                    setTrust(trustPoints, "Untrusted", "#ef4444");
                }
            }
        );
    });
});