function blockAds() {

    let adSelectors = [
        "iframe[src*='ads']",
        "iframe[src*='doubleclick']",
        ".ads",
        ".ad-banner"
    ];

    adSelectors.forEach(selector => {

        document.querySelectorAll(selector).forEach(ad => {
            ad.remove();
        });

    });

}