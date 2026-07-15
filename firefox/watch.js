(function () {
  var params = new URLSearchParams(location.search);
  if (params.get("sd_autodislike") !== "1") return;

  function findDislikeButton() {
    var structural = document.querySelector(
      "dislike-button-view-model.ytDislikeButtonViewModelHost button[aria-label]"
    );
    if (structural) return structural;

    var buttons = document.querySelectorAll("button[aria-label]");
    for (var i = 0; i < buttons.length; i++) {
      var label = (buttons[i].getAttribute("aria-label") || "").toLowerCase();
      if (label.indexOf("dislike this video") !== -1) return buttons[i];
    }
    return null;
  }

  function tryClick() {
    var btn = findDislikeButton();
    if (!btn) return false;

    if (btn.getAttribute("aria-pressed") !== "true") {
      // Clicking fires an async dislike request; the background script
      // waits for that network request to complete before closing this tab,
      // so we don't report done here.
      btn.click();
    } else {
      browser.runtime.sendMessage({ type: "auto-dislike-done" });
    }
    return true;
  }

  if (tryClick()) return;

  var observer = new MutationObserver(function () {
    if (tryClick()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
