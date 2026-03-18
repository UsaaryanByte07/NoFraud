

function injectPrivacyCss() {
    if (!document.getElementById("noFraud-privacy-css")) {
        const style = document.createElement("style");
        style.id = "noFraud-privacy-css";
        style.textContent = `
            body.nf-blur-emails input[type="email"]:not(:focus),
            body.nf-blur-emails input[name*="email" i]:not(:focus),
            body.nf-blur-emails input[id*="email" i]:not(:focus),
            body.nf-blur-emails input[placeholder*="email" i]:not(:focus) {
                filter: blur(8px) !important;
                transition: filter 0.3s ease !important;
            }
            body.nf-blur-passwords input[type="password"]:not(:focus) {
                filter: blur(8px) !important;
                transition: filter 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
    }
}

function blurPasswords() {
    injectPrivacyCss();
    if (document.body) {
        document.body.classList.add("nf-blur-passwords");
    }
}

function unblurPasswords() {
    if (document.body) {
        document.body.classList.remove("nf-blur-passwords");
    }
}

function blurEmails() {
    injectPrivacyCss();
    if (document.body) {
        document.body.classList.add("nf-blur-emails");
    }
}

function unblurEmails() {
    if (document.body) {
        document.body.classList.remove("nf-blur-emails");
    }
}


chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
        if (changes.emailBlurEnabled !== undefined) {
            if (changes.emailBlurEnabled.newValue === false) {
                unblurEmails();
            } else {
                blurEmails();
            }
        }
        if (changes.passwordBlurEnabled !== undefined) {
            if (changes.passwordBlurEnabled.newValue === false) {
                unblurPasswords();
            } else {
                blurPasswords();
            }
        }
        if (changes.extensionEnabled !== undefined) {
            if (changes.extensionEnabled.newValue === false) {
                unblurEmails();
                unblurPasswords();
            } else {
                chrome.storage.local.get(["emailBlurEnabled", "passwordBlurEnabled"], (data) => {
                    if (data.emailBlurEnabled !== false) blurEmails();
                    if (data.passwordBlurEnabled !== false) blurPasswords();
                });
            }
        }
    }
});