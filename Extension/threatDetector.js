

function detectThreats() {
    const currentUrl = window.location.href;
    const lowerUrl = currentUrl.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const protocol = window.location.protocol;

    chrome.storage.local.get(["childMode", "guardianPin"], (data) => {
        const isChildModeOn = data.childMode === true;
        const guardianPin = data.guardianPin;

        let isThreat = false;
        let threatReason = "";

        // --- 1. LOCAL SYNC CHECKS (Immediate) ---

        // A. Phishing Keywords
        const phishingKeywords = [
            "login-verify", "secure-update", "bank-verification",
            "account-reset", "confirm-password", "verify-identity",
            "paypal-secure", "apple-id-verify", "signin-alert",
            "blockchain-wallet", "coinbase-login", "metamask-fix"
        ];
        if (phishingKeywords.some(kw => lowerUrl.includes(kw))) {
            isThreat = true;
            threatReason = "Phishing keywords detected in URL.";
        }

        
        if (hostname.includes("xn--")) {
            isThreat = true;
            threatReason = "Punycode detected (possible homograph spoofing attack).";
        }

        
        const riskyTlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".pw", ".buzz", ".icu", ".cam"];
        if (riskyTlds.some(tld => hostname.endsWith(tld))) {
            isThreat = true;
            threatReason = `High-risk domain extension (${hostname.split('.').pop()}) detected.`;
        }

        
        if (isChildModeOn) {
            const restrictedKeywords = [
                "pornhub", "xvideos", "xnxx", "redtube", "youporn", "porn",
                "bet365", "casinos", "gambling", "poker", "roulette", "stake.com",
                "onlyfans", "chaturbate", "camgirls", "escort", "nsfw", "gore", "violence"
            ];
            if (restrictedKeywords.some(kw => lowerUrl.includes(kw))) {
                isThreat = true;
                threatReason = "Restricted Content (Child Protection Enabled).";
            }

            
            const socialGamingDomains = [
                "facebook.com", "instagram.com", "tiktok.com", "twitter.com", "x.com",
                "roblox.com", "fortnite.com", "twitch.tv", "discord.com", "steamcommunity.com"
            ];
            if (socialGamingDomains.some(domain => hostname.includes(domain))) {
                isThreat = true;
                threatReason = "Social Media / Gaming is restricted in Child Mode.";
            }

            
            const pageText = document.body.innerText.toLowerCase();
            const badWords = ["sex", "naked", "gamble", "kill", "drug", "casino"];
            if (badWords.some(word => pageText.includes(word))) {
                
                let matchCount = badWords.filter(word => pageText.includes(word)).length;
                if (matchCount >= 2) {
                    isThreat = true;
                    threatReason = "Inappropriate content detected on the page.";
                }
            }

            
            document.querySelectorAll('img').forEach(img => {
                img.style.filter = "blur(10px) grayscale(100%)";
                img.style.transition = "filter 0.5s";
                img.title = "Blocked by NoFraud Child Protection";
            });

            
            const chatSelectors = ['[class*="chat"]', '[id*="chat"]', '.comments', '#comments'];
            chatSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.remove());
            });
        }

        
        chrome.runtime.sendMessage(
            { action: "checkURLThreats", url: currentUrl },
            (response) => {
                if (chrome.runtime.lastError) {
                    
                }

                if (response && response.isThreat) {
                    isThreat = true;
                    threatReason = "Google Safe Browsing Flag: " + response.type.replace(/_/g, " ");
                }

                
                if (isThreat) {
                    if (isChildModeOn) {
                        showChildLockScreen(threatReason, guardianPin);
                    } else {
                        showThreatAlert("CRITICAL: " + threatReason + " — Leave this site immediately!", "#dc2626");
                    }
                } else {
                    
                    const isLocal = hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.");
                    if (protocol === "http:" && !isLocal && !isChildModeOn) {
                        showThreatAlert("MODERATE RISK: This site uses an unsecured HTTP connection.", "#f59e0b");
                    }
                }
            }
        );

        
        if (isThreat) {
            if (isChildModeOn) {
                showChildLockScreen(threatReason, guardianPin);
            } else {
                showThreatAlert("CRITICAL: " + threatReason + " — Leave this site immediately!", "#dc2626");
            }
        }
    });
}


function showChildLockScreen(reason, realPin) {
    if (document.getElementById("nofraud-child-lock")) return;

    const overlay = document.createElement("div");
    overlay.id = "nofraud-child-lock";
    
    
    document.body.style.overflow = "hidden";
    document.querySelectorAll('video, audio').forEach(media => {
        try { media.pause(); media.muted = true; } catch (e) {}
    });

    Object.assign(overlay.style, {
        position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
        background: "rgba(15, 23, 42, 0.98)", zIndex: "2147483647",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        color: "#fff", fontFamily: "'Segoe UI', Tahoma, sans-serif", backdropFilter: "blur(15px)"
    });

    overlay.innerHTML = `
        <div style="text-align: center; max-width: 450px; padding: 40px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div style="font-size: 64px; margin-bottom: 20px;">🛑</div>
            <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 12px; color: #ef4444;">Access Blocked</h1>
            <p style="font-size: 16px; color: #94a3b8; margin-bottom: 20px;">Guardian Mode has blocked this website.</p>
            <p style="font-size: 14px; color: #fb923c; margin-bottom: 30px; padding: 10px; background: rgba(251, 146, 60, 0.1); border-radius: 8px;">Reason: ${reason}</p>
            
            <p style="font-size: 14px; color: #e2e8f0; margin-bottom: 10px; font-weight: 600;">Guardian Unlock:</p>
            <input type="password" id="nofraud-pin-input" placeholder="Enter PIN" maxlength="4" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: #fff; font-size: 18px; text-align: center; letter-spacing: 4px; margin-bottom: 15px; outline: none;">
            <p id="nofraud-pin-error" style="color: #ef4444; font-size: 14px; margin-bottom: 15px; display: none;">Incorrect PIN.</p>
            <button id="nofraud-pin-btn" style="width: 100%; padding: 14px; background: #38bdf8; color: #fff; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s;">Unlock Access</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const btn = document.getElementById("nofraud-pin-btn");
    const input = document.getElementById("nofraud-pin-input");
    const errorMsg = document.getElementById("nofraud-pin-error");

    btn.addEventListener("click", () => {
        if (input.value === realPin) {
            overlay.remove();
            document.body.style.overflow = "auto";
        } else {
            errorMsg.style.display = "block";
            input.value = "";
        }
    });

    input.addEventListener("keyup", (e) => {
        if (e.key === "Enter") btn.click();
    });
}


function showThreatAlert(message, bgColor = "#dc2626") {
    
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

    
    setTimeout(() => {
        alertBox.style.opacity = "0";
        setTimeout(() => alertBox.remove(), 300);
    }, 8000);
}