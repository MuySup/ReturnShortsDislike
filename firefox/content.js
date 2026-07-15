(function () {
  var DONE = "data-shorts-copy-done";
  var CLONE = "data-shorts-copy-clone";
  var DISLIKE_TEXT = "I don't like this";
  var loadingButtons = {};
  var requestCounter = 0;

  var LIKE_OUTLINE_D =
    "M16.25 2.5c3.823 0 6.75 3.232 6.75 7 0 4.436-2.806 7.696-5.224 9.699-2.46 2.038-4.906 3.104-4.98 3.135l-.796.347-.797-.347c-.073-.031-2.52-1.097-4.98-3.135C3.807 17.196 1 13.936 1 9.5c0-3.768 2.927-7 6.75-7 1.629 0 3.1.596 4.25 1.565A6.559 6.559 0 0 1 16.25 2.5zm0 2c-1.861 0-3.47 1.128-4.25 2.768C11.22 5.628 9.611 4.5 7.75 4.5 5.127 4.5 3 6.74 3 9.5c0 7.09 9 11 9 11s9-3.91 9-11c0-2.76-2.127-5-4.75-5z";

  var DISLIKE_OUTLINE_D =
    "M440-501Zm0 381L313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 22t81 62q34-40 81-62t99-22q84 0 153 59t69 160q0 14-2 29.5t-6 31.5h-85q5-18 8-34t3-30q0-75-50-105.5T620-760q-51 0-88 27.5T463-660h-46q-31-45-70.5-72.5T260-760q-57 0-98.5 39.5T120-621q0 33 14 67t50 78.5q36 44.5 98 104T440-228q26-23 61-53t56-50l9 9 19.5 19.5L605-283l9 9q-22 20-56 49.5T498-172l-58 52Zm160-280v-80h320v80H600Z";

  var DISLIKE_FILLED_D =
    "M600-400v-80h320v80H600ZM440-120 313-234q-72-65-123.5-116t-85-96q-33.5-45-49-87T40-621q0-94 63-156.5T260-840q52 0 99 21.5t81 61.5q34-40 81-61.5t99-21.5q85 0 142.5 51.5T834-668q-18-7-36-10.5t-35-3.5q-101 0-172 70.5T520-440q0 52 21 98.5t59 79.5q-19 17-49.5 43.5T498-172l-58 52Z";

  var HIDE_OUTLINE_D =
    "m791-55-91-91q-49 32-104.5 49T480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-60 17-115.5T146-700l-91-91 57-57 736 736-57 57ZM480-160q43 0 83.5-11t78.5-33L204-642q-22 38-33 78.5T160-480q0 133 93.5 226.5T480-160Zm334-100-58-58q22-38 33-78.5t11-83.5q0-133-93.5-226.5T480-800q-43 0-83.5 11T318-756l-58-58q49-32 104.5-49T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 60-17 115.5T814-260ZM537-537ZM423-423Z";

  var HIDE_FILLED_D =
    "m791-55-91-91q-49 32-104.5 49T480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-60 17-115.5T146-700l-91-91 57-57 736 736-57 57Zm23-205L260-814q49-32 104.5-49T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 60-17 115.5T814-260Z";

  var WARNING_D =
    "M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z";

  var NOT_INTERESTED_TEXT = "Not interested";
  var NOT_SIGNED_IN_TEXT = "Not signed in";

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

  function showTip(btn, text) {
    removeTip();
    var tip = document.createElement("div");
    tip.id = "shorts-dislike-tip";
    tip.setAttribute("popover", "manual");
    tip.className = "ytPopoverComponentHost ytTooltipContainerDefaultTooltipContent";

    var span = document.createElement("span");
    span.textContent = text;
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

  function shortsVideoId() {
    var match = location.pathname.match(/\/shorts\/([^/?#]+)/);
    return match ? match[1] : null;
  }

  function videoIdForElement(el) {
    var node = el;
    while (node && node !== document.documentElement) {
      if (node.tagName === "YTD-REEL-VIDEO-RENDERER") {
        if (node.data && node.data.videoId) return node.data.videoId;
        var link = node.querySelector('a[href*="/shorts/"]');
        if (link) {
          var match = link.getAttribute("href").match(/\/shorts\/([^/?#]+)/);
          if (match) return match[1];
        }
        break;
      }
      node = node.parentElement;
    }
    return shortsVideoId();
  }

  function feedbackTokenForElement(el) {
    var node = el;
    while (node && node !== document.documentElement) {
      if (node.tagName === "YTD-REEL-VIDEO-RENDERER") {
        var data = node.data;
        var items = data && data.menu && data.menu.menuRenderer && data.menu.menuRenderer.items;
        if (items) {
          for (var i = 0; i < items.length; i++) {
            var itemRenderer = items[i] && items[i].menuServiceItemRenderer;
            if (!itemRenderer) continue;
            var runs = itemRenderer.text && itemRenderer.text.runs;
            var label = runs && runs[0] && runs[0].text;
            if (label && /not interested/i.test(label)) {
              var endpoint = itemRenderer.serviceEndpoint;
              if (endpoint && endpoint.feedbackEndpoint && endpoint.feedbackEndpoint.feedbackToken) {
                return endpoint.feedbackEndpoint.feedbackToken;
              }
            }
          }
        }
        break;
      }
      node = node.parentElement;
    }
    return null;
  }

  function formatCount(n) {
    if (n < 1000) return String(n);
    var divisor = n < 1000000 ? 1000 : n < 1000000000 ? 1000000 : 1000000000;
    var suffix = divisor === 1000 ? "B" : divisor === 1000000 ? "Mn" : "Mr";
    var value = n / divisor;
    var decimals = value < 10 ? 1 : 0;
    var text = value.toFixed(decimals).replace(".", ",");
    if (decimals === 1 && text.slice(-2) === ",0") text = text.slice(0, -2);
    return text + " " + suffix;
  }

  function apiErrorMessage(status) {
    if (status === 400) return "400 Bad Request";
    if (status === 404) return '404 "Not Found"';
    if (status === 429) return "429 Rate Limited";
    return status ? status + " Error" : "Connection Error";
  }

  var cookieSpeedupEnabled = true;
  var dislikeMode = "dislike";

  function loadSettings() {
    try {
      browser.storage.local.get("cookieSpeedup").then(function (result) {
        cookieSpeedupEnabled = result.cookieSpeedup !== false;
      });
      browser.storage.onChanged.addListener(function (changes, area) {
        if (area !== "local") return;
        if (changes.cookieSpeedup) cookieSpeedupEnabled = changes.cookieSpeedup.newValue !== false;
      });
    } catch (e) {}
  }

  function extractBalancedObject(text, start) {
    if (text[start] !== "{") return null;
    var depth = 0;
    var inString = false;
    var stringChar = "";
    var escaped = false;
    for (var i = start; i < text.length; i++) {
      var ch = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (ch === "\\") escaped = true;
        else if (ch === stringChar) inString = false;
        continue;
      }
      if (ch === '"' || ch === "'") {
        inString = true;
        stringChar = ch;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }
    return null;
  }

  function getInnertubeConfig() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var text = scripts[i].textContent;
      if (!text || text.indexOf("INNERTUBE_API_KEY") === -1) continue;

      var searchIdx = 0;
      var idx;
      while ((idx = text.indexOf("ytcfg.set(", searchIdx)) !== -1) {
        var start = text.indexOf("(", idx) + 1;
        searchIdx = idx + 1;
        var json = extractBalancedObject(text, start);
        if (!json) continue;
        try {
          var parsed = JSON.parse(json);
        } catch (e) {
          continue;
        }
        if (parsed && parsed.INNERTUBE_API_KEY && parsed.INNERTUBE_CONTEXT) {
          return { apiKey: parsed.INNERTUBE_API_KEY, context: parsed.INNERTUBE_CONTEXT };
        }
      }
    }
    return null;
  }

  var abortControllers = {};

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function computeSapisidHash(sapisid, origin) {
    var timestamp = Math.floor(Date.now() / 1000);
    var input = timestamp + " " + sapisid + " " + origin;
    var data = new TextEncoder().encode(input);
    return crypto.subtle.digest("SHA-1", data).then(function (hashBuffer) {
      var hex = Array.prototype.map
        .call(new Uint8Array(hashBuffer), function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
      return timestamp + "_" + hex;
    });
  }

  function buildAuthHeaders() {
    var origin = "https://www.youtube.com";
    var sapisid = getCookie("SAPISID") || getCookie("__Secure-3PAPISID");
    var authPromise = sapisid ? computeSapisidHash(sapisid, origin) : Promise.resolve(null);
    return authPromise.then(function (hash) {
      var headers = { "Content-Type": "application/json" };
      if (hash) {
        headers["Authorization"] = "SAPISIDHASH " + hash;
        headers["X-Origin"] = origin;
        headers["X-Goog-AuthUser"] = "0";
      }
      return headers;
    });
  }

  function sendLikeActionViaCookie(action, videoId, requestId, onDone) {
    var cfg = getInnertubeConfig();
    if (!cfg) {
      onDone(false, 0);
      return;
    }

    var controller = new AbortController();
    abortControllers[requestId] = controller;

    buildAuthHeaders()
      .then(function (headers) {
        return fetch(
          "https://www.youtube.com/youtubei/v1/like/" +
            action +
            "?key=" +
            encodeURIComponent(cfg.apiKey) +
            "&prettyPrint=false",
          {
            method: "POST",
            credentials: "same-origin",
            signal: controller.signal,
            headers: headers,
            body: JSON.stringify({ context: cfg.context, target: { videoId: videoId } }),
          }
        );
      })
      .then(function (res) {
        delete abortControllers[requestId];
        onDone(res.ok, res.status);
      })
      .catch(function () {
        delete abortControllers[requestId];
        onDone(false, 0);
      });
  }

  function sendFeedbackViaCookie(feedbackToken, requestId, onDone) {
    var cfg = getInnertubeConfig();
    if (!cfg) {
      onDone(false, 0);
      return;
    }

    var controller = new AbortController();
    abortControllers[requestId] = controller;

    buildAuthHeaders()
      .then(function (headers) {
        return fetch(
          "https://www.youtube.com/youtubei/v1/feedback?key=" +
            encodeURIComponent(cfg.apiKey) +
            "&prettyPrint=false",
          {
            method: "POST",
            credentials: "same-origin",
            signal: controller.signal,
            headers: headers,
            body: JSON.stringify({
              context: cfg.context,
              feedbackTokens: [feedbackToken],
              isFeedbackTokenUnencrypted: false,
              shouldMerge: false,
            }),
          }
        );
      })
      .then(function (res) {
        delete abortControllers[requestId];
        onDone(res.ok, res.status);
      })
      .catch(function () {
        delete abortControllers[requestId];
        onDone(false, 0);
      });
  }

  var dislikeCountCache = {};

  function fetchDislikeCount(videoId, callback) {
    if (dislikeCountCache.hasOwnProperty(videoId)) {
      callback({ count: dislikeCountCache[videoId] });
      return;
    }
    fetch("https://returnyoutubedislikeapi.com/votes?videoId=" + encodeURIComponent(videoId))
      .then(function (res) {
        if (!res.ok) {
          callback({ error: apiErrorMessage(res.status) });
          return null;
        }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        dislikeCountCache[videoId] = data.dislikes;
        callback({ count: data.dislikes });
      })
      .catch(function () {
        callback({ error: apiErrorMessage(0) });
      });
  }

  function bumpDisplayedCount(node, videoId, delta) {
    if (!dislikeCountCache.hasOwnProperty(videoId)) return;
    dislikeCountCache[videoId] = Math.max(0, dislikeCountCache[videoId] + delta);
    var text = node.querySelector(".ytSpecButtonShapeWithLabelLabel span");
    if (text) text.textContent = formatCount(dislikeCountCache[videoId]);
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
        var SVG_NS = "http://www.w3.org/2000/svg";
        var spinnerSvg = document.createElementNS(SVG_NS, "svg");
        spinnerSvg.setAttribute("width", "18");
        spinnerSvg.setAttribute("height", "18");
        spinnerSvg.setAttribute("viewBox", "0 0 24 24");
        spinnerSvg.style.animation = "shorts-dislike-spin .8s linear infinite";
        var spinnerCircle = document.createElementNS(SVG_NS, "circle");
        spinnerCircle.setAttribute("cx", "12");
        spinnerCircle.setAttribute("cy", "12");
        spinnerCircle.setAttribute("r", "9");
        spinnerCircle.setAttribute("fill", "none");
        spinnerCircle.setAttribute("stroke", "currentColor");
        spinnerCircle.setAttribute("stroke-width", "2.5");
        spinnerCircle.setAttribute("stroke-dasharray", "40 16");
        spinnerCircle.setAttribute("stroke-linecap", "round");
        spinnerSvg.appendChild(spinnerCircle);
        spinner.appendChild(spinnerSvg);
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

    var SVG_NS = "http://www.w3.org/2000/svg";

    var span = document.createElement("span");
    span.className = "yt-icon-shape style-scope yt-icon ytSpecIconShapeHost";

    var div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.display = "block";
    div.style.fill = "currentcolor";

    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("fill", "none");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("aria-hidden", "true");
    svg.style.pointerEvents = "none";
    svg.style.display = "inherit";
    svg.style.width = "100%";
    svg.style.height = "100%";

    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "currentColor");

    svg.appendChild(path);
    div.appendChild(svg);
    span.appendChild(div);

    iconBox.textContent = "";
    iconBox.appendChild(span);
  }

  function patchTargetIcon(target, d, viewBox) {
    var btn = target.querySelector("button.ytSpecButtonShapeNextMono[aria-label]");
    if (!btn) return;
    var path = btn.querySelector("svg path[d]");
    if (!path) return;
    path.setAttribute("d", d);
    var svg = path.closest("svg");
    if (svg && viewBox) svg.setAttribute("viewBox", viewBox);
  }

  function markUnauthenticated(node, btn) {
    setIcon(node, WARNING_D, "0 -960 960 960");
    var text = node.querySelector(".ytSpecButtonShapeWithLabelLabel span");
    if (text) text.textContent = NOT_SIGNED_IN_TEXT;
    btn.dataset.pressed = "false";
    btn.setAttribute("aria-pressed", "false");
  }

  function applyDislikeStyle(node, target, originalLike) {
    var hideMode = dislikeMode === "hide";
    var tipText = hideMode ? NOT_INTERESTED_TEXT : DISLIKE_TEXT;

    setIcon(node, hideMode ? HIDE_OUTLINE_D : DISLIKE_OUTLINE_D, "0 -960 960 960");

    var text = node.querySelector(".ytSpecButtonShapeWithLabelLabel span");
    if (text) {
      if (hideMode) {
        text.textContent = NOT_INTERESTED_TEXT;
      } else {
        text.textContent = "Dislike";
        var videoId = videoIdForElement(target);
        if (videoId) {
          fetchDislikeCount(videoId, function (result) {
            if (result.error) {
              text.textContent = result.error;
              return;
            }
            text.textContent = formatCount(result.count);
          });
        }
      }
    }

    var btn = node.querySelector("button[aria-label]");
    if (!btn) return;

    btn.setAttribute("aria-label", tipText);
    btn.setAttribute("aria-pressed", "false");

    btn.addEventListener("mouseenter", function () {
      showTip(btn, tipText);
    });
    btn.addEventListener("mouseleave", removeTip);

    if (hideMode) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (btn.dataset.loading === "true" || btn.dataset.pressed === "true") return;

        if (!cookieSpeedupEnabled) {
          console.warn("[Return Shorts Dislike] Not interested requires \"Speed up using cookies\" to be enabled.");
          return;
        }
        var token = feedbackTokenForElement(target);
        if (!token) {
          console.warn("[Return Shorts Dislike] Could not find a feedbackToken for this Short.", target);
          return;
        }

        btn.dataset.pressed = "true";
        btn.setAttribute("aria-pressed", "true");

        var requestId = "req-" + ++requestCounter;
        btn.dataset.requestId = requestId;
        loadingButtons[requestId] = btn;
        btn.dataset.loading = "true";
        setSpinner(btn, true);

        sendFeedbackViaCookie(token, requestId, function (ok, status) {
          stopLoading(btn);
          if (!ok) {
            if (status === 401) {
              markUnauthenticated(node, btn);
            } else {
              console.warn("[Return Shorts Dislike] feedback request failed", status);
              btn.dataset.pressed = "false";
              btn.setAttribute("aria-pressed", "false");
            }
            return;
          }
          setIcon(node, HIDE_FILLED_D, "0 -960 960 960");
        });
      });
      return;
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (btn.dataset.loading === "true") {
        var pendingRequestId = btn.dataset.requestId;
        if (cookieSpeedupEnabled && abortControllers[pendingRequestId]) {
          abortControllers[pendingRequestId].abort();
          delete abortControllers[pendingRequestId];
        } else {
          browser.runtime.sendMessage({ type: "cancel-open-bg-tab", requestId: pendingRequestId });
        }
        stopLoading(btn);

        var prevPressed = btn.dataset.pendingPrevPressed === "true";
        btn.dataset.pressed = String(prevPressed);
        btn.setAttribute("aria-pressed", String(prevPressed));
        if (prevPressed) {
          setIcon(node, DISLIKE_FILLED_D, "0 -960 960 960");
          patchTargetIcon(target, LIKE_OUTLINE_D, "0 0 24 24");
        } else {
          setIcon(node, DISLIKE_OUTLINE_D, "0 -960 960 960");
          patchTargetIcon(target, originalLike.d, originalLike.viewBox);
        }
        return;
      }

      var videoIdForClick = videoIdForElement(target) || shortsVideoId();
      var url = videoIdForClick
        ? "https://www.youtube.com/watch?v=" + videoIdForClick
        : watchUrlFromShorts();
      if (!url) return;

      var pressed = btn.dataset.pressed === "true";
      var next = !pressed;
      btn.dataset.pendingPrevPressed = String(pressed);
      btn.dataset.pressed = String(next);
      btn.setAttribute("aria-pressed", String(next));

      if (next) {
        setIcon(node, DISLIKE_FILLED_D, "0 -960 960 960");
        patchTargetIcon(target, LIKE_OUTLINE_D, "0 0 24 24");
      } else {
        setIcon(node, DISLIKE_OUTLINE_D, "0 -960 960 960");
        patchTargetIcon(target, originalLike.d, originalLike.viewBox);
      }

      var requestId = "req-" + ++requestCounter;
      btn.dataset.requestId = requestId;
      btn.dataset.videoId = videoIdForClick || "";
      loadingButtons[requestId] = btn;

      btn.dataset.loading = "true";
      setSpinner(btn, true);

      if (cookieSpeedupEnabled && videoIdForClick) {
        var action = next ? "dislike" : "removelike";
        sendLikeActionViaCookie(action, videoIdForClick, requestId, function (ok, status) {
          stopLoading(btn);
          if (!ok) {
            if (status === 401) markUnauthenticated(node, btn);
            return;
          }
          bumpDisplayedCount(node, videoIdForClick, action === "dislike" ? 1 : -1);
        });
      } else {
        browser.runtime.sendMessage({ type: "open-bg-tab", url: url, requestId: requestId });
      }
    });

    var likeBtn = target.querySelector("button.ytSpecButtonShapeNextMono[aria-label]");
    if (likeBtn) {
      likeBtn.addEventListener("click", function () {
        if (btn.dataset.loading === "true") {
          var pendingRequestId2 = btn.dataset.requestId;
          if (cookieSpeedupEnabled && abortControllers[pendingRequestId2]) {
            abortControllers[pendingRequestId2].abort();
            delete abortControllers[pendingRequestId2];
          } else {
            browser.runtime.sendMessage({ type: "cancel-open-bg-tab", requestId: pendingRequestId2 });
          }
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
    var requestId = btn.dataset.requestId;
    if (requestId) {
      if (loadingButtons[requestId] === btn) delete loadingButtons[requestId];
      delete btn.dataset.requestId;
    }
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
    if (message && message.type === "bg-tab-loaded" && message.requestId) {
      var btn = loadingButtons[message.requestId];
      if (btn) {
        var node = btn.closest(LIKE_HOST_SELECTOR);
        var videoId = btn.dataset.videoId;
        if (node && videoId) bumpDisplayedCount(node, videoId, 1);
        stopLoading(btn);
      }
    }
  });

  ensureSpinnerStyle();
  loadSettings();
  run();
})();
