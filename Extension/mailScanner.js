function scanEmailDomain(email) {

    let domain = email.split("@")[1];

    let riskyDomains = [
        "temporarymail.com",
        "fakeinbox.com",
        "fraudmail.net"
    ];

    if (riskyDomains.includes(domain)) {
        return "HIGH RISK";
    }

    return "SAFE";

}