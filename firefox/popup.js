(function () {
  function extractVideoId(urlString) {
    var url;
    try {
      url = new URL(urlString);
    } catch (e) {
      return null;
    }
    if (url.hostname.indexOf("youtube.com") === -1) return null;

    var shortsMatch = url.pathname.match(/\/shorts\/([^/?#]+)/);
    if (shortsMatch) return shortsMatch[1];

    return url.searchParams.get("v");
  }

  function formatCount(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function apiErrorMessage(status) {
    if (status === 400) return "400 Bad Request";
    if (status === 404) return '404 "Not Found"';
    if (status === 429) return "429 Rate Limited";
    return status ? status + " Error" : "Connection Error";
  }

  function setupModeSwitch() {
    var options = document.querySelectorAll(".mode-option");
    var indicator = document.getElementById("modeIndicator");

    function moveIndicatorTo(option) {
      indicator.style.left = option.offsetLeft + "px";
      indicator.style.width = option.offsetWidth + "px";
    }

    function activate(option) {
      options.forEach(function (o) {
        o.classList.remove("active");
      });
      option.classList.add("active");
      moveIndicatorTo(option);
    }

    options.forEach(function (option) {
      option.addEventListener("click", function () {
        activate(option);
        try {
          browser.storage.local.set({ dislikeMode: option.dataset.mode }).catch(function (err) {
            console.error("dislikeMode set failed", err);
          });
        } catch (e) {
          console.error("dislikeMode set threw", e);
        }
      });
    });

    var active = document.querySelector(".mode-option.active") || options[0];
    if (active) moveIndicatorTo(active);

    try {
      browser.storage.local.get("dislikeMode").then(function (result) {
        if (!result.dislikeMode) return;
        var stored = document.querySelector('.mode-option[data-mode="' + result.dislikeMode + '"]');
        if (stored && !stored.classList.contains("disabled")) activate(stored);
      }, function (err) {
        console.error("dislikeMode get failed", err);
      });
    } catch (e) {
      console.error("dislikeMode get threw", e);
    }
  }

  function setupAdvancedPanel() {
    var toggle = document.getElementById("advancedToggle");
    var panel = document.getElementById("advancedPanel");
    toggle.addEventListener("click", function () {
      toggle.classList.toggle("open");
      panel.classList.toggle("open");
    });

    var cookieSwitch = document.getElementById("cookieSpeedupSwitch");
    try {
      browser.storage.local.get("cookieSpeedup").then(function (result) {
        // Default to enabled for first-time users (no stored value yet).
        if (result.cookieSpeedup !== false) cookieSwitch.classList.add("on");
      }, function (err) {
        console.error("cookieSpeedup get failed", err);
      });
    } catch (e) {
      console.error("cookieSpeedup get threw", e);
    }
    document.getElementById("cookieSpeedupOption").addEventListener("click", function () {
      var enabled = !cookieSwitch.classList.contains("on");
      cookieSwitch.classList.toggle("on", enabled);
      try {
        browser.storage.local.set({ cookieSpeedup: enabled }).catch(function (err) {
          console.error("cookieSpeedup set failed", err);
        });
      } catch (e) {
        console.error("cookieSpeedup set threw", e);
      }
    });
  }

  function disableContextMenuAndSelection() {
    document.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });
  }

  async function main() {
    var likesEl = document.getElementById("likes");
    var dislikesEl = document.getElementById("dislikes");

    var tabs = await browser.tabs.query({ active: true, currentWindow: true });
    var tab = tabs[0];
    var videoId = tab && tab.url ? extractVideoId(tab.url) : null;

    if (!videoId) {
      likesEl.textContent = "--";
      dislikesEl.textContent = "--";
      return;
    }

    try {
      var res = await fetch(
        "https://returnyoutubedislikeapi.com/votes?videoId=" + encodeURIComponent(videoId)
      );
      if (!res.ok) {
        var message = apiErrorMessage(res.status);
        likesEl.textContent = message;
        dislikesEl.textContent = message;
        return;
      }
      var data = await res.json();

      likesEl.textContent = formatCount(data.likes);
      dislikesEl.textContent = formatCount(data.dislikes);
    } catch (e) {
      var errorMessage = apiErrorMessage(0);
      likesEl.textContent = errorMessage;
      dislikesEl.textContent = errorMessage;
    }
  }

  disableContextMenuAndSelection();
  setupModeSwitch();
  setupAdvancedPanel();
  main();
})();
