function withMarker(url) {
  var sep = url.indexOf("?") === -1 ? "?" : "&";
  return url + sep + "sd_autodislike=1";
}

var pendingByWatchTab = {};
var watchTabByRequestId = {};

function clearPending(watchTabId) {
  var entry = pendingByWatchTab[watchTabId];
  if (!entry) return null;
  clearTimeout(entry.timeout);
  if (entry.webRequestListener) {
    browser.webRequest.onCompleted.removeListener(entry.webRequestListener);
  }
  delete pendingByWatchTab[watchTabId];
  if (watchTabByRequestId[entry.requestId] === watchTabId) {
    delete watchTabByRequestId[entry.requestId];
  }
  return entry;
}

function finish(watchTabId, notify) {
  var entry = clearPending(watchTabId);
  if (!entry) return;
  if (notify && entry.senderTabId !== undefined) {
    browser.tabs
      .sendMessage(entry.senderTabId, { type: "bg-tab-loaded", requestId: entry.requestId })
      .catch(function () {});
  }
  browser.tabs.remove(watchTabId).catch(function () {});
}

browser.runtime.onMessage.addListener(function (message, sender) {
  var senderTabId = sender.tab && sender.tab.id;

  if (message && message.type === "open-bg-tab" && message.url) {
    browser.tabs.create({ url: withMarker(message.url), active: false }).then(function (tab) {
      var watchTabId = tab.id;

      // Don't close the tab right after the click event fires: YouTube's own
      // dislike POST request (.../youtubei/v1/like/dislike) is async and can
      // take well over half a second even on a good connection. Closing the
      // tab before that request completes cancels it, so we wait for the
      // actual network request to finish instead of a fixed delay.
      var webRequestListener = function () {
        finish(watchTabId, true);
      };
      browser.webRequest.onCompleted.addListener(webRequestListener, {
        urls: ["*://www.youtube.com/youtubei/v1/like/dislike*"],
        tabId: watchTabId,
      });

      pendingByWatchTab[watchTabId] = {
        senderTabId: senderTabId,
        requestId: message.requestId,
        webRequestListener: webRequestListener,
        timeout: setTimeout(function () {
          finish(watchTabId, true);
        }, 20000),
      };
      if (message.requestId !== undefined) watchTabByRequestId[message.requestId] = watchTabId;
    });
    return;
  }

  if (message && message.type === "cancel-open-bg-tab") {
    var watchTabId2 = watchTabByRequestId[message.requestId];
    if (watchTabId2 !== undefined) finish(watchTabId2, false);
    return;
  }

  if (message && message.type === "auto-dislike-done" && sender.tab) {
    finish(sender.tab.id, true);
  }
});
