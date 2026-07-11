/**
 * JJA-015 — Reaction Tap v4.3
 * Gracie Barra Lake Country Jiu-Jitsu Arcade
 *
 * FIXES v4.3:
 *   1. START ROLLING phantom tap — overlay pointerdown bubbles through to stage
 *      after overlay is removed in the same gesture. Fixed with a _startedAt
 *      timestamp guard: _answer() ignores all input for 500ms after game start.
 *
 *   2. Every button tap = WRONG — the stage 'click' fallback listener was
 *      catching the synthetic click Android fires after pointerdown on a button,
 *      calling _answer('position') after the button already answered.
 *      Fixed by removing the 'click' fallback entirely. touchend handles mobile,
 *      pointerdown (mouse only) handles desktop — no click listener needed.
 *
 *   3. TAP POSITION button restored — removes ambiguity about stage tap intent
 *      on mobile. Both answers now have explicit, large tap targets. Stage tap
 *      still works as a third way to answer position.
 *
 * PRESERVED from v4.2:
 *   - passive touchstart + touchend scroll-delta guard (scroll lock fix)
 *   - touch-action: manipulation on stage (not 'none')
 *   - _answering lock (double-fire guard)
 *   - 0-byte JSON guard
 *
 * window.JJGames['reaction-tap'].mount(rootEl, cfg)
 * cfg = { dataUrl, assetBase }
 */
(function () {
  'use strict';

  // JJA v2: feedback layer -- optional-chained so the game runs unchanged if the
  // shared utilities fail to load.
  var fx = {
    sfx: function (key) { if (window.JJArcadeAudio) window.JJArcadeAudio.playSfx(key); },
    vibe: function (p) { if (window.JJArcadeAudio) window.JJArcadeAudio.vibrate(p); },
    burst: function (elm) { if (window.JJArcadeJuice && elm) window.JJArcadeJuice.burstFromEl(elm); }
  };

  // ── Utility ────────────────────────────────────────────────────────────────
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'style' && typeof attrs[k] === 'object') {
          Object.assign(e.style, attrs[k]);
        } else if (k === 'class') {
          e.className = attrs[k];
        } else {
          e.setAttribute(k, attrs[k]);
        }
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return e;
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  var CSS = [
    '.rt-wrap{font-family:\'Oswald\',\'Arial Narrow\',Arial,sans-serif;max-width:520px;margin:0 auto;padding:12px;box-sizing:border-box;user-select:none;-webkit-user-select:none;position:relative;}',
    '.rt-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}',
    '.rt-score{font-size:1.6rem;font-weight:700;color:#c0392b;letter-spacing:1px;}',
    '.rt-combo{font-size:1rem;color:#e67e22;font-weight:600;min-height:1.4em;text-align:center;}',
    '.rt-lives{font-size:1.4rem;letter-spacing:3px;}',

    /* touch-action: manipulation — allows taps, does NOT kill page scroll */
    '.rt-stage{position:relative;width:100%;aspect-ratio:4/3;background:#1a1a2e;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;touch-action:manipulation;cursor:pointer;}',
    '@media(max-width:480px){.rt-stage{aspect-ratio:unset;min-height:300px;}}',
    '.rt-stage img{max-width:100%;max-height:100%;object-fit:contain;pointer-events:none;}',
    '.rt-stage.rt-correct{outline:6px solid #27ae60;}',
    '.rt-stage.rt-wrong{outline:6px solid #c0392b;animation:rt-shake 0.35s ease;}',
    '@keyframes rt-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}',

    /* Timer bar */
    '.rt-timer-bar-wrap{width:100%;height:8px;background:#333;border-radius:4px;margin:8px 0;overflow:hidden;}',
    '.rt-timer-bar{height:100%;background:#c0392b;border-radius:4px;}',

    /* Feedback overlay inside stage */
    '.rt-feedback{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:2.2rem;font-weight:900;letter-spacing:2px;pointer-events:none;opacity:0;}',
    '.rt-feedback.rt-fb-show{opacity:1;}',
    '.rt-feedback.rt-fb-correct{color:#27ae60;text-shadow:0 0 20px rgba(39,174,96,0.8);}',
    '.rt-feedback.rt-fb-wrong{color:#c0392b;text-shadow:0 0 20px rgba(192,57,43,0.8);}',

    /* Label bottom of stage */
    '.rt-label{position:absolute;bottom:10px;left:0;right:0;text-align:center;color:rgba(255,255,255,0.9);font-size:0.85rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,0.9);}',

    /* Instruction row */
    '.rt-instruction{text-align:center;font-size:0.88rem;color:#666;margin:8px 0 6px;line-height:1.5;}',

    /* Two-button row */
    '.rt-btn-row{display:flex;gap:10px;margin-top:6px;}',

    /* POSITION button */
    '.rt-img-btn{flex:1;padding:18px 10px;background:#2c3e50;color:#fff;font-family:inherit;font-size:1rem;font-weight:700;letter-spacing:1px;border:none;border-radius:10px;cursor:pointer;text-transform:uppercase;transition:background 0.15s,transform 0.1s;touch-action:manipulation;white-space:normal;text-align:center;line-height:1.2;}',
    '.rt-img-btn:active{background:#1a252f;transform:scale(0.97);}',
    '.rt-img-btn.rt-btn-highlight{background:#27ae60;}',

    /* SUBMISSION button */
    '.rt-sub-btn{flex:1;padding:18px 10px;background:#c0392b;color:#fff;font-family:inherit;font-size:1rem;font-weight:700;letter-spacing:1px;border:none;border-radius:10px;cursor:pointer;text-transform:uppercase;transition:background 0.15s,transform 0.1s;touch-action:manipulation;white-space:normal;text-align:center;line-height:1.2;}',
    '.rt-sub-btn:active{background:#96211b;transform:scale(0.97);}',
    '.rt-sub-btn.rt-btn-highlight{background:#c0392b;box-shadow:0 0 16px rgba(192,57,43,0.7);}',

    /* Overlays */
    '.rt-overlay{position:absolute;inset:0;background:rgba(26,26,46,0.97);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:10px;border-radius:12px;z-index:10;padding:16px 20px 20px;box-sizing:border-box;overflow-y:auto;}',
    '.rt-overlay h2{color:#fff;font-size:1.6rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0;text-align:center;flex-shrink:0;}',
    '.rt-overlay .rt-final-score{font-size:2.6rem;font-weight:900;color:#c0392b;flex-shrink:0;}',
    '.rt-overlay p{color:#aaa;font-size:0.82rem;text-align:center;margin:0;line-height:1.5;flex-shrink:0;}',
    '.rt-overlay .rt-play-btn{background:#c0392b;color:#fff;border:none;border-radius:8px;padding:14px 32px;font-family:inherit;font-size:1rem;font-weight:700;letter-spacing:2px;cursor:pointer;text-transform:uppercase;transition:background 0.2s;flex-shrink:0;margin-top:auto;touch-action:manipulation;}',
    '.rt-overlay .rt-play-btn:hover{background:#96211b;}',

    /* Legend pills */
    '.rt-legend{display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap;}',
    '.rt-legend-pill{font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:999px;letter-spacing:0.5px;}',
    '.rt-legend-pos{background:#2c3e50;color:#fff;}',
    '.rt-legend-sub{background:#c0392b;color:#fff;}',

    /* Mobile: stack buttons vertically if very narrow */
    '@media(max-width:400px){.rt-btn-row{flex-direction:column;}.rt-img-btn,.rt-sub-btn{padding:16px 10px;font-size:0.95rem;}}'
  ].join('');

  function injectCSS(id) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id;
    s.setAttribute('data-noptimize', '1');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── Game constructor ───────────────────────────────────────────────────────
  function Game(root, cfg) {
    this.root          = root;
    this.cfg           = cfg;
    this.images        = [];
    this.settings      = {};
    this.score         = 0;
    this.lives         = 3;
    this.combo         = 0;
    this.current       = null;
    this.phase         = 'idle';
    this.round         = 0;
    this._lastIdx      = null;
    this._timer        = null;
    this._timerRaf     = null;
    this._answering    = false;  // double-fire guard
    this._touchStartY  = 0;      // scroll delta guard
    this._startedAt    = 0;      // FIX v4.3: phantom-tap guard timestamp
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  Game.prototype.load = function (done) {
    var self = this;
    fetch(self.cfg.dataUrl)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !Array.isArray(data.images) || data.images.length === 0) {
          self.root.innerHTML = [
            '<div style="color:#c0392b;padding:20px;font-family:Oswald,Arial,sans-serif;background:#1a1a2e;border-radius:12px;text-align:center;">',
            '<div style="font-size:1.4rem;font-weight:700;margin-bottom:8px;">⚠️ Game Data Missing</div>',
            '<div style="font-size:0.9rem;color:#aaa;">reaction-tap.json loaded but contains no images.<br>Upload the populated JSON to IONOS → assets/jj-arcade/data/</div>',
            '</div>'
          ].join('');
          return;
        }
        self.images   = data.images;
        self.settings = data.settings || {};
        self.lives    = self.settings.lives || 3;
        done();
      })
      .catch(function (err) {
        self.root.innerHTML = [
          '<div style="color:#c0392b;padding:20px;font-family:Oswald,Arial,sans-serif;background:#1a1a2e;border-radius:12px;text-align:center;">',
          '<div style="font-size:1.4rem;font-weight:700;margin-bottom:8px;">⚠️ Failed to Load</div>',
          '<div style="font-size:0.9rem;color:#aaa;">Could not fetch reaction-tap.json<br>' + (err && err.message ? err.message : '') + '</div>',
          '</div>'
        ].join('');
      });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  Game.prototype.render = function () {
    injectCSS('rt-css');
    var self = this;
    self.root.innerHTML = '';

    var wrap = el('div', { class: 'rt-wrap' });

    // HUD
    self._scoreEl = el('div', { class: 'rt-score' }, '0 pts');
    self._livesEl = el('div', { class: 'rt-lives' }, '❤️❤️❤️');
    wrap.appendChild(el('div', { class: 'rt-header' }, [self._scoreEl, self._livesEl]));

    self._comboEl = el('div', { class: 'rt-combo' }, '');
    wrap.appendChild(self._comboEl);

    // Timer bar
    var timerWrap  = el('div', { class: 'rt-timer-bar-wrap' });
    self._timerBar = el('div', { class: 'rt-timer-bar', style: { width: '100%' } });
    timerWrap.appendChild(self._timerBar);
    wrap.appendChild(timerWrap);

    // Stage
    self._stage    = el('div', { class: 'rt-stage' });
    self._img      = el('img', { src: '', alt: '', style: { display: 'none' } });
    self._feedback = el('div', { class: 'rt-feedback' });
    self._labelEl  = el('div', { class: 'rt-label' }, '');

    self._stage.appendChild(self._img);
    self._stage.appendChild(self._feedback);
    self._stage.appendChild(self._labelEl);

    // Start overlay
    self._overlay = self._buildStartOverlay();
    self._stage.appendChild(self._overlay);

    // ── Stage touch listeners ─────────────────────────────────────────────
    //
    // MOBILE path — touchstart (passive) records Y for scroll detection.
    //               touchend checks delta: > 10px = scroll, ignore.
    //               _startedAt guard swallows phantom tap from START ROLLING lift.
    //               NO click listener — Android synthetic click after button
    //               pointerdown would bubble here and double-fire _answer().
    //
    // DESKTOP path — pointerdown with pointerType guard (skips touch events).
    //                Same _startedAt guard applied.
    // ─────────────────────────────────────────────────────────────────────

    self._stage.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length > 0) {
        self._touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    self._stage.addEventListener('touchend', function (e) {
      if (e.target.tagName === 'BUTTON') return;
      if (e.target !== self._stage && e.target !== self._img) return;
      var endY   = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : self._touchStartY;
      var deltaY = Math.abs(endY - self._touchStartY);
      if (deltaY > 10) return;
      if (Date.now() - self._startedAt < 500) return; // phantom-tap guard
      self._answer('position');
    });

    // Desktop mouse only — pointerType guard skips touch
    self._stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      if (e.target.tagName === 'BUTTON') return;
      if (e.target !== self._stage && e.target !== self._img) return;
      if (Date.now() - self._startedAt < 500) return; // phantom-tap guard
      self._answer('position');
    });

    wrap.appendChild(self._stage);

    // Instruction
    wrap.appendChild(el('div', { class: 'rt-instruction' },
      '👇 TAP image or POSITION button  •  ⚡ TAP SUBMIT = Submission'
    ));

    // ── Two buttons ───────────────────────────────────────────────────────
    // pointerdown + stopPropagation on both.
    // stopPropagation stops the event reaching the stage listener.
    // No click listeners anywhere — avoids Android synthetic click double-fire.
    // _startedAt guard on each button too.
    // ─────────────────────────────────────────────────────────────────────

    var btnRow = el('div', { class: 'rt-btn-row' });

    self._imgBtn = el('button', { class: 'rt-img-btn' }, '👇 POSITION');
    self._imgBtn.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      if (Date.now() - self._startedAt < 500) return;
      self._answer('position');
    });

    self._subBtn = el('button', { class: 'rt-sub-btn' }, '⚡ TAP TO SUBMIT');
    self._subBtn.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      if (Date.now() - self._startedAt < 500) return;
      self._answer('submission');
    });

    btnRow.appendChild(self._imgBtn);
    btnRow.appendChild(self._subBtn);
    wrap.appendChild(btnRow);

    // Legend
    wrap.appendChild(el('div', { class: 'rt-legend' }, [
      el('span', { class: 'rt-legend-pill rt-legend-pos' }, '👇 POSITION = tap image or left button'),
      el('span', { class: 'rt-legend-pill rt-legend-sub' }, '⚡ SUBMISSION = right button')
    ]));

    self.root.appendChild(wrap);
  };

  // ── Overlays ──────────────────────────────────────────────────────────────
  Game.prototype._buildStartOverlay = function () {
    var self = this;
    var o = el('div', { class: 'rt-overlay' });
    o.appendChild(el('h2', {}, '⚡ Reaction Tap'));
    o.appendChild(el('p', {}, '👇 Tap image or POSITION button = Position'));
    o.appendChild(el('p', {}, '⚡ TAP TO SUBMIT button = Submission'));
    o.appendChild(el('p', {}, '❤️ ' + (this.settings.lives || 3) + ' lives  •  Combo multipliers'));
    var btn = el('button', { class: 'rt-play-btn' }, 'START ROLLING');
    btn.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      self._startGame();
    });
    o.appendChild(btn);
    return o;
  };

  Game.prototype._buildGameOverOverlay = function () {
    var self = this;
    var o = el('div', { class: 'rt-overlay' });
    o.appendChild(el('h2', {}, 'TAPPED OUT'));
    o.appendChild(el('div', { class: 'rt-final-score' }, self.score + ' pts'));
    o.appendChild(el('p', {}, 'Round ' + self.round + ' survived'));
    var btn = el('button', { class: 'rt-play-btn' }, 'GO AGAIN');
    btn.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      fx.sfx('ui_tap');
      self._startedAt = Date.now(); // reset phantom-tap guard for new game
      self._resetGame();
    });
    o.appendChild(btn);
    return o;
  };

  // ── Game flow ─────────────────────────────────────────────────────────────
  Game.prototype._startGame = function () {
    fx.sfx('ui_tap');
    this._overlay.remove();
    this._answering   = false;
    this._touchStartY = 0;
    this._startedAt   = Date.now(); // FIX v4.3: start phantom-tap guard window
    this._nextRound();
  };

  Game.prototype._resetGame = function () {
    this.score        = 0;
    this.lives        = this.settings.lives || 3;
    this.combo        = 0;
    this.round        = 0;
    this.phase        = 'idle';
    this._lastIdx     = null;
    this._answering   = false;
    this._touchStartY = 0;
    // _startedAt set in GO AGAIN handler before calling this
    this._stage.querySelectorAll('.rt-overlay').forEach(function (o) { o.remove(); });
    this._updateHUD();
    this._nextRound();
  };

  Game.prototype._nextRound = function () {
    var self = this;
    clearTimeout(self._timer);
    cancelAnimationFrame(self._timerRaf);

    self.round++;
    self.phase        = 'showing';
    self._answering   = false;
    self._touchStartY = 0;

    var pool = self.images.slice();
    if (self._lastIdx !== null && pool.length > 1) pool.splice(self._lastIdx, 1);
    var pick      = pool[Math.floor(Math.random() * pool.length)];
    self._lastIdx = self.images.indexOf(pick);
    self.current  = pick;

    self._stage.className      = 'rt-stage';
    self._feedback.className   = 'rt-feedback';
    self._feedback.textContent = '';
    self._labelEl.textContent  = '';
    self._img.src              = self.cfg.assetBase + '/' + pick.file;
    self._img.alt              = pick.label;
    self._img.style.display    = 'block';

    self._imgBtn.classList.remove('rt-btn-highlight');
    self._subBtn.classList.remove('rt-btn-highlight');

    fx.sfx('countdown_tick'); // "react now" cue as each new image appears
    var duration = self.settings.displayTime || 2000;
    self._startTimerBar(duration);

    self._timer = setTimeout(function () {
      if (self.phase !== 'showing') return;
      self._wrong('Too slow! That was ' + pick.label);
    }, duration);
  };

  // ── Answer handler ────────────────────────────────────────────────────────
  Game.prototype._answer = function (buttonType) {
    if (this.phase !== 'showing') return;
    if (this._answering) return;
    if (this._stage.querySelector('.rt-overlay')) return;
    if (!this.current) return;

    this._answering = true;

    clearTimeout(this._timer);
    cancelAnimationFrame(this._timerRaf);

    var correct = (buttonType === this.current.type);
    if (correct) {
      this._correct(buttonType);
    } else {
      var shouldHave = this.current.type === 'submission'
        ? 'That was a submission — use TAP TO SUBMIT!'
        : 'That\'s a position — tap image or POSITION!';
      this._wrong(shouldHave);
    }
  };

  Game.prototype._correct = function (buttonType) {
    var self       = this;
    self.phase     = 'feedback';
    self.combo++;
    var multiplier = Math.min(self.combo, 5);
    var pts        = (self.settings.pointsPerCorrect || 100) * multiplier;
    self.score    += pts;

    fx.sfx('correct'); // correct tap chime
    fx.vibe('short');
    fx.burst(self._stage);
    self._stage.classList.add('rt-correct');
    self._feedback.textContent = buttonType === 'submission' ? '⚡ SUBMIT!' : '✅ POSITION!';
    self._feedback.className   = 'rt-feedback rt-fb-show rt-fb-correct';
    self._labelEl.textContent  = '+' + pts + (multiplier > 1 ? '  ×' + multiplier + ' combo!' : '');
    self._comboEl.textContent  = self.combo > 1 ? '🔥 ' + self.combo + 'x COMBO!' : '';
    self._updateHUD();

    setTimeout(function () { self._nextRound(); }, self.settings.feedbackTime || 900);
  };

  Game.prototype._wrong = function (msg) {
    var self   = this;
    self.phase = 'feedback';
    self.combo = 0;
    self.lives--;
    self._comboEl.textContent = '';

    fx.sfx('wrong'); // wrong tap buzz (rt-shake handles the visual shake)
    fx.vibe('double');
    self._stage.classList.add('rt-wrong');
    self._feedback.textContent = '❌ WRONG!';
    self._feedback.className   = 'rt-feedback rt-fb-show rt-fb-wrong';
    self._labelEl.textContent  = msg || '';
    self._updateHUD();

    var delay = self.settings.feedbackTime || 900;

    if (self.lives <= 0) {
      setTimeout(function () {
        self.phase      = 'idle';
        self._answering = false;
        self._timerBar.style.width = '0%';
        self._img.style.display   = 'none';
        self._stage.className     = 'rt-stage';
        self._feedback.className  = 'rt-feedback';
        // JJA v2: personal-best fanfare (feedback only -- reads/writes a localStorage
        // best purely to pick the game-over sound; no gameplay, scoring, or UI change).
        var best = 0;
        try { best = parseInt(localStorage.getItem('jjReactionTapBest') || '0', 10) || 0; } catch (e) {}
        if (self.score > best) {
          try { localStorage.setItem('jjReactionTapBest', String(self.score)); } catch (e) {}
          fx.sfx('highscore'); // new personal best fanfare
          fx.vibe('win');
        } else {
          fx.sfx('stinger_lose');
          fx.vibe('double');
        }
        self._stage.querySelectorAll('.rt-overlay').forEach(function (o) { o.remove(); });
        self._stage.appendChild(self._buildGameOverOverlay());
      }, delay);
    } else {
      setTimeout(function () { self._nextRound(); }, delay);
    }
  };

  // ── Timer bar ─────────────────────────────────────────────────────────────
  Game.prototype._startTimerBar = function (duration) {
    var self  = this;
    var start = performance.now();
    cancelAnimationFrame(self._timerRaf);
    self._timerBar.style.width = '100%';

    function tick(now) {
      var elapsed = now - start;
      var pct     = Math.max(0, 100 - (elapsed / duration) * 100);
      var hue     = Math.round(pct * 1.2);
      self._timerBar.style.background = 'hsl(' + hue + ',85%,45%)';
      self._timerBar.style.width      = pct + '%';
      if (elapsed < duration && self.phase === 'showing') {
        self._timerRaf = requestAnimationFrame(tick);
      }
    }
    self._timerRaf = requestAnimationFrame(tick);
  };

  // ── HUD ───────────────────────────────────────────────────────────────────
  Game.prototype._updateHUD = function () {
    this._scoreEl.textContent = this.score + ' pts';
    var hearts = '';
    var total  = this.settings.lives || 3;
    for (var i = 0; i < total; i++) {
      hearts += i < this.lives ? '❤️' : '🖤';
    }
    this._livesEl.textContent = hearts;
  };

  // ── Public API ─────────────────────────────────────────────────────────────
  window.JJGames = window.JJGames || {};
  window.JJGames['reaction-tap'] = {
    mount: function (root, cfg) {
      var game = new Game(root, cfg);
      game.render();
      game.load(function () {
        game._updateHUD();
      });
    }
  };

})();