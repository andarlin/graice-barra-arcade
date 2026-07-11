/*
 * Jiu-Jitsu Arcade v2 -- shared visual "juice" utility (shake, particle burst, press states).
 * Loaded once by template-jiujitsu-arcade.php next to arcade-audio.js.
 * Pure visual layer: no game logic, safe to no-op if an element is missing.
 */
(function () {
  "use strict";

  // Inject the small amount of CSS this utility needs, so it stays a single file.
  var style = document.createElement("style");
  style.textContent = [
    "@keyframes jjaShake {",
    "  0%, 100% { transform: translateX(0); }",
    "  20% { transform: translateX(-6px); }",
    "  40% { transform: translateX(6px); }",
    "  60% { transform: translateX(-4px); }",
    "  80% { transform: translateX(4px); }",
    "}",
    ".jja-shake { animation: jjaShake 0.35s ease; }",
    ".jja-flash-wrong { animation: jjaFlashWrong 0.35s ease; }",
    "@keyframes jjaFlashWrong {",
    "  0%, 100% { box-shadow: none; }",
    "  50% { box-shadow: 0 0 0 4px rgba(230, 48, 48, 0.55); }",
    "}",
    ".jja-particle {",
    "  position: fixed; width: 8px; height: 8px; border-radius: 2px;",
    "  pointer-events: none; z-index: 9999; will-change: transform, opacity;",
    "}",
    /* generic press state -- games opt in by adding .jja-pressable to tappable elements */
    ".jja-pressable { transition: transform 0.08s ease; }",
    ".jja-pressable:active { transform: scale(0.95); }",
  ].join("\n");
  document.head.appendChild(style);

  var PARTICLE_COLORS = ["#e63030", "#fbbf24", "#4a9eff", "#34d399", "#ffffff"];

  /** Brief horizontal shake + red flash on an element. Reapplies cleanly if already running. */
  function shake(el) {
    if (!el) return;
    el.classList.remove("jja-shake", "jja-flash-wrong");
    // force reflow so the animation restarts even on rapid repeat triggers
    void el.offsetWidth;
    el.classList.add("jja-shake", "jja-flash-wrong");
    el.addEventListener("animationend", function handler() {
      el.classList.remove("jja-shake", "jja-flash-wrong");
      el.removeEventListener("animationend", handler);
    });
  }

  /** Confetti-style particle burst at viewport coordinates (px). */
  function burstAt(x, y, opts) {
    opts = opts || {};
    var count = opts.count || 14;
    var spread = opts.spread || 90; // px travel distance
    var duration = opts.duration || 700;

    for (var i = 0; i < count; i++) {
      var p = document.createElement("div");
      p.className = "jja-particle";
      p.style.background = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
      p.style.left = x + "px";
      p.style.top = y + "px";
      document.body.appendChild(p);

      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      var dist = spread * (0.5 + Math.random() * 0.5);
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - spread * 0.3; // slight upward bias
      var rot = (Math.random() - 0.5) * 540;

      var anim = p.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          { transform: "translate(" + dx + "px, " + dy + "px) rotate(" + rot + "deg)", opacity: 0 },
        ],
        { duration: duration + Math.random() * 200, easing: "cubic-bezier(0.1, 0.6, 0.3, 1)" }
      );
      anim.onfinish = (function (el) {
        return function () { el.remove(); };
      })(p);
    }
  }

  /** Particle burst centered on an element. */
  function burstFromEl(el, opts) {
    if (!el || typeof el.getBoundingClientRect !== "function") return;
    var r = el.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, opts);
  }

  /** Bigger celebratory confetti: several staggered bursts across an element. */
  function confetti(el, opts) {
    if (!el) return;
    var r = el.getBoundingClientRect();
    var bursts = (opts && opts.bursts) || 3;
    for (var i = 0; i < bursts; i++) {
      (function (delay) {
        setTimeout(function () {
          burstAt(
            r.left + r.width * (0.2 + Math.random() * 0.6),
            r.top + r.height * (0.15 + Math.random() * 0.4),
            { count: 18, spread: 130, duration: 900 }
          );
        }, delay);
      })(i * 180);
    }
  }

  window.JJArcadeJuice = {
    shake: shake,
    burstAt: burstAt,
    burstFromEl: burstFromEl,
    confetti: confetti,
  };
})();
