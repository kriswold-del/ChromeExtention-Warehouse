chrome.identity.getProfileUserInfo(function(info) { email = info.email; });
chrome.runtime.onMessage.addListener(function(rq, sender, sendResponse) {
        sendResponse({status: email});
});