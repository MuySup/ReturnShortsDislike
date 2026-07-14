function withMarker(url) {
  var sep = url.indexOf("?") === -1 ? "?" : "&";
  return url + sep + "sd_autodislike=1";
}

var pendingByWatchTab = {};
var watchTabBySender = {};

function clearPending(watchTabId) {
  var entry = pendingByWatchTab[watchTabId];
  if (!entry) return null;
  clearTimeout(entry.timeout);
  delete pendingByWatchTab[watchTabId];
  if (watchTabBySender[entry.senderTabId] === watchTabId) {
    delete watchTabBySender[entry.senderTabId];
  }
  return entry;
}

function finish(watchTabId, notify) {
  var entry = clearPending(watchTabId);
  if (!entry) return;
  if (notify && entry.senderTabId !== undefined) {
    browser.tabs.sendMessage(entry.senderTabId, { type: "bg-tab-loaded" }).catch(function () {});
  }
  browser.tabs.remove(watchTabId).catch(function () {});
}

browser.runtime.onMessage.addListener(function (message, sender) {
  var senderTabId = sender.tab && sender.tab.id;

  if (message && message.type === "open-bg-tab" && message.url) {
    if (senderTabId !== undefined && watchTabBySender[senderTabId] !== undefined) {
      finish(watchTabBySender[senderTabId], false);
    }
    browser.tabs.create({ url: withMarker(message.url), active: false }).then(function (tab) {
      pendingByWatchTab[tab.id] = {
        senderTabId: senderTabId,
        timeout: setTimeout(function () {
          finish(tab.id, true);
        }, 20000),
      };
      if (senderTabId !== undefined) watchTabBySender[senderTabId] = tab.id;
    });
    return;
  }

  if (message && message.type === "cancel-open-bg-tab") {
    if (senderTabId !== undefined && watchTabBySender[senderTabId] !== undefined) {
      finish(watchTabBySender[senderTabId], false);
    }
    return;
  }

  if (message && message.type === "auto-dislike-done" && sender.tab) {
    finish(sender.tab.id, true);
  }
});
