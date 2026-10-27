/* Election Day countdown: 3:00 PM America/Los_Angeles on November 3, 2026.
   On that date Pacific Standard Time is UTC-08:00, so the deadline is 23:00 UTC.
   The countdown uses the viewer's current clock but not the viewer's time zone. */
(function () {
  "use strict";
  if (window.__firstPollsCountdown2026) return;
  window.__firstPollsCountdown2026 = true;

  var deadline = Date.parse("2026-11-03T15:00:00-08:00");
  var card = null;
  var timer = null;
  var unitNodes = {};

  function normalizedText(element) {
    return (element.textContent || "")
      .replace(/([0-9])([a-zA-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .trim();
  }

  function looksLikeElectionDays(element) {
    var text = normalizedText(element);
    if (text.length > 220) return false;
    return (/\bdays?\b/.test(text) && /\b(election|midterms?|polls|november)\b/.test(text)) ||
      /\b(days?\s+left|days?\s+to\s+go)\b/.test(text) ||
      /\b(election|midterm)\s+countdown\b/.test(text);
  }

  function findCard(home) {
    // The current homepage holds its summary counters in .reference-metrics.
    var metrics = home.querySelectorAll(".reference-metrics > *");
    for (var i = 0; i < metrics.length; i++) {
      if (looksLikeElectionDays(metrics[i])) return metrics[i];
    }

    // Fall back to locating the short label, never replace an entire page/section.
    var labels = home.querySelectorAll("span, small, strong, p, label, h2, h3, div");
    for (var j = 0; j < labels.length; j++) {
      var item = labels[j];
      if (item.children.length > 1 || !looksLikeElectionDays(item)) continue;
      var match = item.closest(".reference-metric, .metric-card, .stat-card, .countdown-card, [class*='countdown'], [class*='metric'], [class*='stat']");
      if (!match || match === home || normalizedText(match).length > 220) {
        match = item.parentElement;
      }
      if (match && match !== home && match !== document.body && normalizedText(match).length < 220) {
        return match;
      }
    }
    return null;
  }

  function addStyles() {
    if (document.getElementById("first-polls-countdown-css")) return;
    var styles = document.createElement("style");
    styles.id = "first-polls-countdown-css";
    styles.textContent = [
      ".polls-close-countdown-host{min-width:0!important;flex:2 1 330px!important;grid-column:span 2!important;box-sizing:border-box!important;}",
      ".polls-close-countdown{width:100%;min-width:0;box-sizing:border-box;border-radius:13px;padding:15px 17px 12px;background:linear-gradient(115deg,#0e2b4d,#164b74);color:white;box-shadow:0 7px 20px rgba(13,37,69,.15);}",
      ".polls-close-heading{color:#dbeafb;font-size:12px;font-weight:850;letter-spacing:.11em;text-transform:uppercase;margin:0 0 10px;text-align:center;}",
      ".polls-close-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;}",
      ".polls-close-unit{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;padding:8px 3px 7px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.09);border-radius:9px;}",
      ".polls-close-value{font-variant-numeric:tabular-nums;font-family:Montserrat,Arial,sans-serif;font-size:clamp(23px,2.35vw,37px);font-weight:800;line-height:1.1;color:#fff;white-space:nowrap;}",
      ".polls-close-unit-label{font-size:10px;letter-spacing:.07em;font-weight:750;color:#dce9f8;margin-top:5px;text-transform:uppercase;}",
      ".polls-close-time{margin-top:9px;font-size:11px;font-weight:650;letter-spacing:.02em;text-align:center;color:#dce9f8;}",
      "@media(max-width:760px){.reference-metrics>.polls-close-countdown-host{grid-column:1/-1!important}.polls-close-countdown{padding:13px 12px}.polls-close-grid{gap:5px}.polls-close-value{font-size:clamp(21px,5.8vw,33px)}.polls-close-unit{padding:8px 2px}}",
      "@media(max-width:360px){.polls-close-unit-label{font-size:9px}.polls-close-heading{font-size:11px}}"
    ].join("");
    document.head.appendChild(styles);
  }

  function mount() {
    var home = document.querySelector("#page-home");
    if (!home) return;
    var target = findCard(home);
    if (!target || target.querySelector(".polls-close-countdown")) return;

    addStyles();
    var box = document.createElement("div");
    box.className = "polls-close-countdown";
    box.innerHTML =
      '<div class="polls-close-heading" data-polls-heading>FIRST POLLS CLOSE IN</div>' +
      '<div class="polls-close-grid" role="timer" aria-label="Countdown to first poll closings at 3 PM Pacific on November 3, 2026" aria-live="off">' +
      '<div class="polls-close-unit"><span class="polls-close-value" data-polls-unit="days">00</span><span class="polls-close-unit-label">Days</span></div>' +
      '<div class="polls-close-unit"><span class="polls-close-value" data-polls-unit="hours">00</span><span class="polls-close-unit-label">Hours</span></div>' +
      '<div class="polls-close-unit"><span class="polls-close-value" data-polls-unit="minutes">00</span><span class="polls-close-unit-label">Minutes</span></div>' +
      '<div class="polls-close-unit"><span class="polls-close-value" data-polls-unit="seconds">00</span><span class="polls-close-unit-label">Seconds</span></div>' +
      '</div>' +
      '<div class="polls-close-time">NOV 3, 2026 &bull; 3:00 PM PACIFIC (6:00 PM EASTERN)</div>';

    target.replaceChildren(box);
    target.classList.add("polls-close-countdown-host");
    card = target;
    timer = box;
    unitNodes = {};
    ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
      unitNodes[unit] = box.querySelector('[data-polls-unit="' + unit + '"]').firstChild;
    });
    update();
  }

  function update() {
    if (!timer || !timer.isConnected) {
      timer = null;
      mount();
      return;
    }
    var remaining = Math.max(0, deadline - Date.now());
    var seconds = Math.ceil(remaining / 1000);
    var days = Math.floor(seconds / 86400);
    var hours = Math.floor((seconds % 86400) / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    var values = { days: days, hours: hours, minutes: minutes, seconds: secs };
    Object.keys(values).forEach(function (unit) {
      var next = String(values[unit]).padStart(2, "0");
      if (unitNodes[unit] && unitNodes[unit].nodeValue !== next) {
        unitNodes[unit].nodeValue = next;
      }
    });
    if (remaining === 0) {
      var heading = timer.querySelector("[data-polls-heading]");
      if (heading) heading.textContent = "FIRST POLLS HAVE CLOSED";
    }
  }

  function start() {
    mount();
    if (!window.__firstPollsCountdownInterval2026) {
      window.__firstPollsCountdownInterval2026 = setInterval(update, 1000);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();