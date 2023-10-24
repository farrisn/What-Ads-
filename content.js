console.log("What Ads? content script... she running! 🫣");

let mutationTimeout;

function removeAdIframes() {
    const adIframeSelectors = [
        'iframe[id^="google_ads_iframe"]',
        'iframe[id^="aswift_"]',
        'iframe[src*="googlesyndication.com"]',
        'iframe[src*="doubleclick.net"]',
        'iframe[src*="amazon-adsystem.com"]',
        'iframe[src*="contextual.media.net"]',
        'iframe[src*="criteo.net"]',
        'iframe[src*="outbrain.com"]',
        'iframe[src*="taboola.com"]'
    ];

    const adElements = document.querySelectorAll(adIframeSelectors.join(','));

    adElements.forEach(element => {
        element.remove();
    });

    return adElements.length;

}

function removeCookieStuff() {
    const cookieSelectors = [
        '[id*="cookie"]', '[class*="cookie"]',
        '[id*="termly"]', '[class*="termly"]',
        '[id*="truste"]', '[class*="truste"]',
        '[id*="gdpr"]', '[class*="gdpr"]',
        '[id*="onetrust"]', '[class*="onetrust"]',
        '[id*="osano"]', '[class*="osano"]',
        '[id*="evidon"]', '[class*="evidon"]',
        '[id*="qc-cmp"]', '[class*="qc-cmp"]',
        '[id*="ccc"]', '[class*="ccc"]',
        '[id*="euc-popup"]', '[class*="euc-banner"]'
    ];

    const cookieElements = document.querySelectorAll(cookieSelectors.join(','));

    cookieElements.forEach(element => {
        element.remove();
    });

    return cookieElements.length;
}


chrome.storage.sync.get('adsRemovalActive', function(data) {
    if (data.adsRemovalActive) {
        const adsRemoved = removeAdIframes();
        const cookiesRemoved = removeCookieStuff();
        const totalRemoved = adsRemoved + cookiesRemoved;

        chrome.runtime.sendMessage({type: "updateBadge", count: totalRemoved});
    }
});

const observer = new MutationObserver(function(mutations) {
    if (mutationTimeout) {
        clearTimeout(mutationTimeout);
    }

    mutationTimeout = setTimeout(() => {
        chrome.storage.sync.get('adsRemovalActive', function(data) {
            if (data.adsRemovalActive) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        removeAdIframes();
                        removeCookieStuff();
                    }
                });
            }
        });
    }, 100);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Message Listener
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "toggleAds") {
            if (request.isEnabled) {
                removeAdIframes();
                removeCookieStuff();
            } else {
                location.reload();
            }
        }
    }
);





