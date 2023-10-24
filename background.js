chrome.storage.sync.get('adsRemovalActive', function(data) {
    if (chrome.runtime.lastError) {
        console.error("We dunno if she been active 🤷‍♂️:", chrome.runtime.lastError);
        return;
    }
    setIconBasedOnState(data.adsRemovalActive);
});

function setIconBasedOnState(isEnabled, tabId) {
    const iconBaseName = isEnabled ? 'iconOn' : 'iconOff';
    try {
        chrome.action.setIcon({
            path: {
                16: `icons/${iconBaseName}16.png`,
                48: `icons/${iconBaseName}48.png`,
                128: `icons/${iconBaseName}128.png`
            },
            tabId: tabId
        });
    } catch (error) {
        console.error(error);
    }
}

chrome.action.onClicked.addListener(function(tab) {
    chrome.storage.sync.get('adsRemovalActive', function(data) {
        const newState = !data.adsRemovalActive;
        chrome.storage.sync.set({ adsRemovalActive: newState }, function() {
            if (chrome.runtime.lastError) {
                console.error("Couldn't do something about something:", chrome.runtime.lastError);
                return;
            }
            if (tab.url.startsWith('chrome://' || 'https://support.google' || 'https://www.google')) {
                console.log("doesn't work on Chrome's internal pages obvi...");
                return;
            }
            setIconBasedOnState(newState, tab.id);

            chrome.tabs.sendMessage(tab.id, {
                action: "toggleAds",
                isEnabled: newState
            });
        });
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    try {
        if (message.type === "updateBadge") {
            const count = message.count.toString();
            
            
            chrome.contextMenus.update("blockedCount", {
                title: "Stuff blocked 🤖: " + count
            });
        }

    } catch (error) {
        console.error("onMessage listner no workie 😐:", error);
    }
});


chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "donate") {
        chrome.tabs.create({ url: 'https://www.zeffy.com/en-CA/donation-form/8451f146-2b0e-4fbd-a073-225ace7ecf18' });
    } else if (info.menuItemId === "blockedCount") {
        chrome.tabs.create({ url: 'chrome://extensions/?options=' + chrome.runtime.id });
    }
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        chrome.storage.sync.set({ adsRemovalActive: true }, function() {
            setIconBasedOnState(true);
        });
    }

    chrome.contextMenus.create({
        id: "blockedCount",
        title: "Stuff blocked 🤖: 0",
        contexts: ["action"],
    }, function() {
        if (chrome.runtime.lastError) {
            console.error("No counter button 🙄:", chrome.runtime.lastError);
        }
    });

    chrome.contextMenus.create({
        id: "donate",
        title: "Donate 🤑",
        contexts: ["action"]
    }, function() {
        if (chrome.runtime.lastError) {
            console.error("Donation button wasn't created... 🥺 no cash money today:", chrome.runtime.lastError);
        }
    });

});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        chrome.storage.sync.get('adsRemovalActive', function(data) {
            setIconBasedOnState(data.adsRemovalActive);
        });
    }
});

