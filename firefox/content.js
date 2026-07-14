(function () {
  var DONE = "data-shorts-copy-done";
  var CLONE = "data-shorts-copy-clone";
  var DISLIKE_TEXT = "I don't like this";
  var currentLoadingButton = null;

  var LIKE_OUTLINE_D =
    "M16.25 2.5c3.823 0 6.75 3.232 6.75 7 0 4.436-2.806 7.696-5.224 9.699-2.46 2.038-4.906 3.104-4.98 3.135l-.796.347-.797-.347c-.073-.031-2.52-1.097-4.98-3.135C3.807 17.196 1 13.936 1 9.5c0-3.768 2.927-7 6.75-7 1.629 0 3.1.596 4.25 1.565A6.559 6.559 0 0 1 16.25 2.5zm0 2c-1.861 0-3.47 1.128-4.25 2.768C11.22 5.628 9.611 4.5 7.75 4.5 5.127 4.5 3 6.74 3 9.5c0 7.09 9 11 9 11s9-3.91 9-11c0-2.76-2.127-5-4.75-5z";

  var DISLIKE_OUTLINE_D =
    "M440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q84 0 153 59t69 160q0 14-2 29.5t-6 31.5h-85q5-18 8-34t3-30q0-75-50-105.5T620-760q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Zm160-280v-80h320v80H600Z";

  var DISLIKE_FILLED_D =
    "M600-400v-80h320v80H600ZM440-120 313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 21.5t81 61.5q34-40 81-61.5t99-21.5q85 0 142.5 51.5T834-668q-18-7-36-10.5t-35-3.5q-101 0-172 70.5T520-440q0 52 21 98.5t59 79.5q-19 17-49.5 43.5T498-172l-58 52Z";

  var LIKE_HOST_SELECTOR = "like-button-view-model.ytLikeButtonViewModelHost";

  function getLikeBlock() {
    var candidates = document.querySelectorAll(LIKE_HOST_SELECTOR);
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (el.hasAttribute(CLONE) || el.hasAttribute(DONE)) continue;
      var btn = el.querySelector("button.ytSpecButtonShapeNextMono[aria-label]");
      if (!btn) continue;
      return el;
    }
    return null;
  }

  function removeTip() {
    var existing = document.getElementById("shorts-dislike-tip");
    if (existing) existing.remove();
  }

  function showTip(btn) {
    removeTip();
    var tip = document.createElement("div");
    tip.id = "shorts-dislike-tip";
    tip.setAttribute("popover", "manual");
    tip.className = "ytPopoverComponentHost ytTooltipContainerDefaultTooltipContent";

    var span = document.createElement("span");
    span.textContent = DISLIKE_TEXT;
    tip.appendChild(span);
    document.body.appendChild(tip);

    if (tip.showPopover) tip.showPopover();

    var rect = btn.getBoundingClientRect();
    var tipRect = tip.getBoundingClientRect();
    var left = rect.left + rect.width / 2 - tipRect.width / 2;
    var top = rect.top - tipRect.height - 8;
    tip.style.inset = Math.max(4, top) + "px auto auto " + Math.max(4, left) + "px";
  }

  function watchUrlFromShorts() {
    var match = location.pathname.match(/\/shorts\/([^/?#]+)/);
    if (!match) return null;
    return "https://www.youtube.com/watch?v=" + match[1];
  }

  function ensureSpinnerStyle() {
    if (document.getElementById("shorts-dislike-style")) return;
    var style = document.createElement("style");
    style.id = "shorts-dislike-style";
    style.textContent =
      "@keyframes shorts-dislike-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
    document.head.appendChild(style);
  }

  function setSpinner(btn, loading) {
    var iconBox = btn.querySelector(".ytSpecButtonShapeNextIcon");
    if (!iconBox) return;
    var spinner = btn.querySelector(".shorts-dislike-spinner");

    if (loading) {
      iconBox.style.visibility = "hidden";
      if (!spinner) {
        spinner = document.createElement("div");
        spinner.className = "shorts-dislike-spinner";
        spinner.style.position = "absolute";
        spinner.style.inset = "0";
        spinner.style.display = "flex";
        spinner.style.alignItems = "center";
        spinner.style.justifyContent = "center";
        spinner.style.pointerEvents = "none";
        spinner.innerHTML =
          '<svg width="18" height="18" viewBox="0 0 24 24" style="animation: shorts-dislike-spin .8s linear infinite;">' +
          '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="40 16" stroke-linecap="round"></circle>' +
          "</svg>";
        if (getComputedStyle(btn).position === "static") btn.style.position = "relative";
        btn.appendChild(spinner);
      }
    } else {
      iconBox.style.visibility = "";
      if (spinner) spinner.remove();
    }
  }

  function setIcon(node, d, viewBox) {
    var iconBox = node.querySelector(".ytSpecButtonShapeNextIcon");
    if (!iconBox) return;
    iconBox.innerHTML =
      '<span class="yt-icon-shape style-scope yt-icon ytSpecIconShapeHost">' +
      '<div style="width: 100%; height: 100%; display: block; fill: currentcolor;">' +
      '<svg width="24" height="24" viewBox="' +
      viewBox +
      '" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;">' +
      '<path d="' +
      d +
      '" fill="currentColor"></path>' +
      "</svg></div></span>";
  }

  function applyDislikeStyle(node, target, originalLike) {
    setIcon(node, DISLIKE_OUTLINE_D, "0 -960 960 960");

    var text = node.querySelector(".ytSpecButtonShapeWithLabelLabel span");
    if (text) text.textContent = "Dislike";

    var btn = node.querySelector("button[aria-label]");
    if (!btn) return;

    btn.setAttribute("aria-label", DISLIKE_TEXT);
    btn.setAttribute("aria-pressed", "false");

    btn.addEventListener("mouseenter", function () {
      showTip(btn);
    });
    btn.addEventListener("mouseleave", removeTip);

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (btn.dataset.loading === "true") {
        browser.runtime.sendMessage({ type: "cancel-open-bg-tab" });
        stopLoading(btn);

        var prevPressed = btn.dataset.pendingPrevPressed === "true";
        btn.dataset.pressed = String(prevPressed);
        btn.setAttribute("aria-pressed", String(prevPressed));
        if (prevPressed) {
          setIcon(node, DISLIKE_FILLED_D, "0 -960 960 960");
          setIcon(target, LIKE_OUTLINE_D, "0 0 24 24");
        } else {
          setIcon(node, DISLIKE_OUTLINE_D, "0 -960 960 960");
          setIcon(target, originalLike.d, originalLike.viewBox);
        }
        return;
      }

      var url = watchUrlFromShorts();
      if (!url) return;

      var pressed = btn.dataset.pressed === "true";
      var next = !pressed;
      btn.dataset.pendingPrevPressed = String(pressed);
      btn.dataset.pressed = String(next);
      btn.setAttribute("aria-pressed", String(next));

      if (next) {
        setIcon(node, DISLIKE_FILLED_D, "0 -960 960 960");
        setIcon(target, LIKE_OUTLINE_D, "0 0 24 24");
      } else {
        setIcon(node, DISLIKE_OUTLINE_D, "0 -960 960 960");
        setIcon(target, originalLike.d, originalLike.viewBox);
      }

      btn.dataset.loading = "true";
      setSpinner(btn, true);
      currentLoadingButton = btn;
      browser.runtime.sendMessage({ type: "open-bg-tab", url: url });
    });

    var likeBtn = target.querySelector("button.ytSpecButtonShapeNextMono[aria-label]");
    if (likeBtn) {
      likeBtn.addEventListener("click", function () {
        if (btn.dataset.loading === "true") {
          browser.runtime.sendMessage({ type: "cancel-open-bg-tab" });
          stopLoading(btn);
        }
        if (btn.dataset.pressed === "true") {
          btn.dataset.pressed = "false";
          btn.setAttribute("aria-pressed", "false");
          setIcon(node, DISLIKE_OUTLINE_D, "0 -960 960 960");
        }
      });
    }
  }

  function stopLoading(btn) {
    setSpinner(btn, false);
    btn.dataset.loading = "false";
    if (currentLoadingButton === btn) currentLoadingButton = null;
  }

  function run() {
    if (location.pathname.indexOf("/shorts/") === -1) return;

    var target = getLikeBlock();
    if (!target) return;

    var btn = target.querySelector("button.ytSpecButtonShapeNextMono[aria-label]");
    var path = btn && btn.querySelector("svg path[d]");
    if (!path) return;

    var svg = path.closest("svg");
    var originalLike = {
      d: path.getAttribute("d"),
      viewBox: svg ? svg.getAttribute("viewBox") : "0 0 24 24",
    };

    var copy = target.cloneNode(true);
    copy.setAttribute(CLONE, "true");
    copy.removeAttribute(DONE);
    applyDislikeStyle(copy, target, originalLike);

    target.insertAdjacentElement("afterend", copy);
    target.setAttribute(DONE, "true");
  }

  new MutationObserver(run).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  document.addEventListener("yt-navigate-finish", run);

  var lastHref = location.href;
  setInterval(function () {
    if (location.href !== lastHref) {
      lastHref = location.href;
      run();
    }
  }, 500);

  browser.runtime.onMessage.addListener(function (message) {
    if (message && message.type === "bg-tab-loaded" && currentLoadingButton) {
      stopLoading(currentLoadingButton);
    }
  });

  ensureSpinnerStyle();
  run();
})();
