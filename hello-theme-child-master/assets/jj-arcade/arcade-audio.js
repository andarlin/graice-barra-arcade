/*
 * Jiu-Jitsu Arcade v2 -- shared audio + haptics utility.
 * Loaded once by template-jiujitsu-arcade.php before any per-game script.
 * All 8 games call window.JJArcadeAudio instead of touching <audio>/Web Audio directly.
 */
(function () {
  "use strict";

  var BASE_URL = (function () {
    var thisScript = document.currentScript;
    if (thisScript && thisScript.src) {
      return thisScript.src.replace(/\/arcade-audio\.js.*$/, "");
    }
    return "";
  })();

  var STORAGE_KEY = "jjArcadeFeedback"; // single on/off flag: covers sound + haptics

  var DEFAULT_SFX = {
    ui_tap: "/sfx/ui_tap.wav",
    correct: "/sfx/correct.wav",
    wrong: "/sfx/wrong.wav",
    fanfare: "/sfx/fanfare.wav",
    highscore: "/sfx/highscore.wav",
    stinger_lose: "/sfx/stinger_lose.wav",
    swoosh: "/sfx/swoosh.wav",
    countdown_tick: "/sfx/countdown_tick.wav",
    coin: "/sfx/coin.wav",
    hit: "/sfx/hit.wav",
    shoot: "/sfx/shoot.wav",
    explosion: "/sfx/explosion.wav",
    footstep: "/sfx/footstep.wav",
    snap: "/sfx/snap.wav",
  };
  var DEFAULT_MUSIC_URL = "/sfx/music/arcade-loop.wav";

  var VIBRATE_PATTERNS = {
    short: 15,
    double: [30, 40, 30],
    win: [20, 30, 20, 30, 60],
  };

  var ctx = null;
  var buffers = {}; // key -> AudioBuffer
  var pending = {}; // key -> Promise<AudioBuffer>  (dedupes concurrent decode requests)
  var sfxUrls = Object.assign({}, DEFAULT_SFX);
  var unlocked = false;
  var muted = readMuted();
  var muteListeners = [];

  var musicEl = null;
  var musicWantsPlaying = false; // true if music should be playing absent tab-blur/mute

  function readMuted() {
    try {
      var v = window.localStorage.getItem(STORAGE_KEY);
      if (v === null) return false; // default: feedback on, but audio still gated by autoplay unlock
      return v === "off";
    } catch (e) {
      return false;
    }
  }

  function writeMuted(isMuted) {
    try {
      window.localStorage.setItem(STORAGE_KEY, isMuted ? "off" : "on");
    } catch (e) {
      /* localStorage unavailable (private mode etc) -- state just won't persist */
    }
  }

  function resolveUrl(url) {
    if (/^https?:\/\//i.test(url) || url.indexOf("/") === 0 && BASE_URL === "") return url;
    return BASE_URL + url;
  }

  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  }

  function loadBuffer(key, url) {
    var c = getCtx();
    if (!c) return Promise.resolve(null);
    if (buffers[key]) return Promise.resolve(buffers[key]);
    if (pending[key]) return pending[key];

    pending[key] = fetch(resolveUrl(url))
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (data) {
        return new Promise(function (resolve, reject) {
          // decodeAudioData has both promise and callback signatures across browsers
          var maybePromise = c.decodeAudioData(data, resolve, reject);
          if (maybePromise && typeof maybePromise.then === "function") {
            maybePromise.then(resolve, reject);
          }
        });
      })
      .then(function (decoded) {
        buffers[key] = decoded;
        delete pending[key];
        return decoded;
      })
      .catch(function (err) {
        delete pending[key];
        console.warn("[JJArcadeAudio] failed to load sfx '" + key + "'", err);
        return null;
      });

    return pending[key];
  }

  function preloadAll() {
    Object.keys(sfxUrls).forEach(function (key) {
      loadBuffer(key, sfxUrls[key]);
    });
  }

  /** Call on first user gesture (tap/click/keydown) to satisfy autoplay policy. */
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    var c = getCtx();
    if (c && c.state === "suspended") {
      c.resume().catch(function () {});
    }
    preloadAll();
    if (musicWantsPlaying) resumeMusicPlayback();
  }

  function playSfx(key) {
    if (muted) return;
    var c = getCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume().catch(function () {});

    var url = sfxUrls[key];
    if (!url) {
      console.warn("[JJArcadeAudio] unknown sfx key '" + key + "'");
      return;
    }

    var playNow = function (buffer) {
      if (!buffer || muted) return;
      try {
        var source = c.createBufferSource();
        source.buffer = buffer;
        var gain = c.createGain();
        gain.gain.value = 0.6;
        source.connect(gain).connect(c.destination);
        source.start(0);
      } catch (e) {
        console.warn("[JJArcadeAudio] playback failed for '" + key + "'", e);
      }
    };

    if (buffers[key]) {
      playNow(buffers[key]);
    } else {
      loadBuffer(key, url).then(playNow);
    }
  }

  function registerSfx(key, url) {
    sfxUrls[key] = url;
    if (unlocked) loadBuffer(key, url);
  }

  // ---- background music (streamed <audio>, not decoded -- fine for a looping bed) ----

  function ensureMusicEl(url) {
    if (musicEl && musicEl.dataset.src === url) return musicEl;
    if (musicEl) {
      musicEl.pause();
      musicEl.src = "";
    }
    musicEl = new Audio(resolveUrl(url));
    musicEl.loop = true;
    musicEl.preload = "auto";
    musicEl.dataset.src = url;
    return musicEl;
  }

  function resumeMusicPlayback() {
    if (!musicEl || !unlocked || muted || document.hidden) return;
    var p = musicEl.play();
    if (p && typeof p.catch === "function") p.catch(function () {});
  }

  function playMusic(url, opts) {
    url = url || DEFAULT_MUSIC_URL;
    opts = opts || {};
    var volume = typeof opts.volume === "number" ? opts.volume : 0.25;

    ensureMusicEl(url);
    musicEl.volume = volume;
    musicWantsPlaying = true;
    if (unlocked && !muted) resumeMusicPlayback();
  }

  function stopMusic() {
    musicWantsPlaying = false;
    if (musicEl) musicEl.pause();
  }

  document.addEventListener("visibilitychange", function () {
    if (!musicEl) return;
    if (document.hidden) {
      musicEl.pause();
    } else if (musicWantsPlaying && unlocked && !muted) {
      resumeMusicPlayback();
    }
  });

  // ---- haptics ----

  function vibrate(pattern) {
    if (muted) return;
    if (!("vibrate" in navigator)) return;
    var p = typeof pattern === "string" ? VIBRATE_PATTERNS[pattern] : pattern;
    if (!p) return;
    try {
      navigator.vibrate(p);
    } catch (e) {
      /* silently ignore -- unsupported or blocked */
    }
  }

  // ---- mute state (shared by sound + haptics, per product decision) ----

  function isMuted() {
    return muted;
  }

  function setMuted(isMuted) {
    muted = !!isMuted;
    writeMuted(muted);
    if (muted) {
      if (musicEl) musicEl.pause();
    } else if (musicWantsPlaying && unlocked) {
      resumeMusicPlayback();
    }
    muteListeners.forEach(function (fn) {
      try { fn(muted); } catch (e) {}
    });
  }

  function onMuteChange(callback) {
    if (typeof callback === "function") muteListeners.push(callback);
  }

  // Sync mute state across frames/tabs (e.g. the parent arcade's mute toggle and an
  // iframe game share this via localStorage). Applied without re-writing storage to
  // avoid a feedback loop. Storage events only fire in *other* documents.
  window.addEventListener("storage", function (e) {
    if (e.key !== STORAGE_KEY) return;
    var m = e.newValue === "off";
    if (m === muted) return;
    muted = m;
    if (muted) {
      if (musicEl) musicEl.pause();
    } else if (musicWantsPlaying && unlocked) {
      resumeMusicPlayback();
    }
    muteListeners.forEach(function (fn) {
      try { fn(muted); } catch (err) {}
    });
  });

  /** Renders a ready-to-use speaker-icon toggle button into containerEl. */
  function createMuteToggle(containerEl) {
    if (!containerEl) return null;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jja-mute-toggle";
    btn.setAttribute("aria-label", "Toggle sound and vibration");

    function render() {
      btn.textContent = muted ? "🔇" : "🔊"; // 🔇 / 🔊
      btn.classList.toggle("jja-mute-toggle--muted", muted);
      btn.setAttribute("aria-pressed", String(!muted));
    }

    btn.addEventListener("click", function () {
      unlock();
      setMuted(!muted);
    });

    onMuteChange(render);
    render();
    containerEl.appendChild(btn);
    return btn;
  }

  window.JJArcadeAudio = {
    unlock: unlock,
    playMusic: playMusic,
    stopMusic: stopMusic,
    playSfx: playSfx,
    registerSfx: registerSfx,
    vibrate: vibrate,
    isMuted: isMuted,
    setMuted: setMuted,
    onMuteChange: onMuteChange,
    createMuteToggle: createMuteToggle,
  };

  // Unlock on the first interaction anywhere in the arcade, per autoplay policy.
  ["pointerdown", "keydown"].forEach(function (evt) {
    document.addEventListener(evt, unlock, { once: true, passive: true });
  });
})();
