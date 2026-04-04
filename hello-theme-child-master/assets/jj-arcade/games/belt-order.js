/**
 * Belt Order Game — JJA-009
 * Gracie Barra Lake Country · Jiu-Jitsu Arcade
 * Desktop: drag-and-drop with ghost  |  Mobile/touch: tap-to-select → tap-to-place
 * API: window.JJGames['belt-order'].mount(el, config)
 */

(function (global) {
  'use strict';

  var ASSET_BASE = '/wp-content/themes/hello-theme-child-master/assets/jj-arcade/cards/';
  var DATA_URL   = '/wp-content/themes/hello-theme-child-master/assets/jj-arcade/data/belt-order.json';

  var CSS = `
.bo-wrap {
  font-family: inherit;
  max-width: 680px;
  margin: 0 auto;
  padding: 0;
  user-select: none;
  -webkit-user-select: none;
}
.bo-header { text-align: center; margin-bottom: 18px; }
.bo-title  { font-size: 1.4rem; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; }
.bo-subtitle { font-size: 0.95rem; color: #555; }
.bo-mode-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 14px;
}
.bo-mode-btn {
  padding: 8px 22px;
  border-radius: 30px;
  border: 2px solid #c8102e;
  background: #fff;
  color: #c8102e;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.bo-mode-btn.active { background: #c8102e; color: #fff; }
.bo-hint {
  text-align: center;
  font-size: 0.82rem;
  color: #888;
  margin-bottom: 12px;
  min-height: 18px;
  transition: color 0.2s;
}
.bo-hint.active { color: #c8102e; font-weight: 600; }
.bo-lane { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
.bo-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 2px solid #e8e8e8;
  border-radius: 14px;
  padding: 10px 14px;
  cursor: grab;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.12s, background 0.12s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.bo-card.touch-selected {
  border-color: #c8102e;
  background: #fff5f5;
  box-shadow: 0 0 0 3px rgba(200,16,46,0.15), 0 2px 8px rgba(0,0,0,0.10);
  transform: scale(1.025);
}
.bo-card.touch-target {
  border-color: #378ADD;
  background: #f0f6ff;
  box-shadow: 0 0 0 3px rgba(55,138,221,0.15);
}
.bo-card.dragging { opacity: 0.35; cursor: grabbing; }
.bo-card.correct  { border-color: #27ae60; background: #f0fff5; }
.bo-card.incorrect { border-color: #e74c3c; background: #fff5f5; animation: bo-shake 0.35s ease; }
@keyframes bo-shake {
  0%,100% { transform: translateX(0); }
  25%     { transform: translateX(-7px); }
  75%     { transform: translateX(7px); }
}
.bo-drag-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.9;
  border-radius: 14px;
  background: #fff;
  border: 2px solid #c8102e;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  transform: rotate(1.5deg) scale(1.04);
}
.bo-card-img   { width: 80px; height: 60px; object-fit: contain; flex-shrink: 0; pointer-events: none; -webkit-user-drag: none; }
.bo-card-label { font-size: 1rem; font-weight: 600; color: #1a1a1a; pointer-events: none; flex: 1; }
.bo-rank-badge { font-size: 0.78rem; color: #bbb; flex-shrink: 0; }
.bo-rank-badge.ok  { color: #27ae60; font-weight: 700; }
.bo-rank-badge.bad { color: #e74c3c; font-weight: 700; }
.bo-actions { display: flex; justify-content: center; gap: 12px; margin-top: 20px; }
.bo-btn {
  padding: 11px 30px; border-radius: 30px; border: none;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.bo-btn:active { transform: scale(0.97); }
.bo-btn-check   { background: #c8102e; color: #fff; }
.bo-btn-shuffle { background: #f0f0f0; color: #444; }
.bo-score { text-align: center; font-size: 0.85rem; color: #888; margin-top: 14px; min-height: 18px; }
.bo-container { position: relative; }
.bo-overlay {
  position: absolute; inset: 0;
  background: rgba(255,255,255,0.95);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  border-radius: 16px; z-index: 10; padding: 28px 20px; text-align: center;
}
.bo-overlay h2 { font-size: 1.7rem; font-weight: 800; color: #c8102e; margin: 0 0 8px; }
.bo-overlay p  { font-size: 0.95rem; color: #444; margin: 0 0 20px; line-height: 1.5; }
.bo-overlay-belts { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; justify-content: center; }
.bo-overlay-belts img { width: 60px; height: 44px; object-fit: contain; }
@media (max-width: 520px) {
  .bo-card-img   { width: 64px; height: 48px; }
  .bo-card-label { font-size: 0.92rem; }
  .bo-card       { padding: 10px 12px; gap: 10px; }
  .bo-btn        { padding: 11px 22px; font-size: 0.88rem; }
  .bo-title      { font-size: 1.2rem; }
}
`;

  /* ─── Helpers ──────────────────────────────────────────────────────────── */
  function shuffle(a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }

  function injectCSS(id, css) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id; s.textContent = css;
    document.head.appendChild(s);
  }

  function isTouch() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  /* ─── Game ──────────────────────────────────────────────────────────────── */
  function Game(el, data) {
    this.el       = el;
    this.data     = data;
    this.mode     = 'kids';
    this.order    = [];
    this.selected = null;
    this.attempts = 0;
    this.wins     = 0;
    this.ghost    = null;
    this.dragIdx  = null;
    this._build();
  }

  Game.prototype._build = function () {
    injectCSS('jja-bo-css', CSS);
    this.el.innerHTML = '';
    var self = this;

    var wrap = document.createElement('div');
    wrap.className = 'bo-wrap';

    // Header
    wrap.innerHTML = '<div class="bo-header"><div class="bo-title">Belt Order</div><div class="bo-subtitle" id="bo-sub"></div></div>';

    // Mode bar
    var bar = document.createElement('div');
    bar.className = 'bo-mode-bar';
    ['kids','adult'].forEach(function(m) {
      var btn = document.createElement('button');
      btn.className = 'bo-mode-btn' + (m === self.mode ? ' active' : '');
      btn.textContent = m === 'kids' ? '🥋 Future Champions' : '🥋 Adult Belts';
      btn.addEventListener('click', function() {
        self.mode = m;
        bar.querySelectorAll('.bo-mode-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        self._newGame();
      });
      bar.appendChild(btn);
    });
    wrap.appendChild(bar);

    // Hint
    this.hint = document.createElement('div');
    this.hint.className = 'bo-hint';
    this.hint.id = 'bo-hint';
    wrap.appendChild(this.hint);

    // Stage
    this.stage = document.createElement('div');
    this.stage.className = 'bo-container';
    wrap.appendChild(this.stage);

    // Buttons
    var actions = document.createElement('div');
    actions.className = 'bo-actions';
    this.checkBtn = document.createElement('button');
    this.checkBtn.className = 'bo-btn bo-btn-check';
    this.checkBtn.textContent = 'Check Order';
    this.checkBtn.addEventListener('click', function(){ self._check(); });
    actions.appendChild(this.checkBtn);
    var shuffleBtn = document.createElement('button');
    shuffleBtn.className = 'bo-btn bo-btn-shuffle';
    shuffleBtn.textContent = 'Shuffle Again';
    shuffleBtn.addEventListener('click', function(){ self._newGame(); });
    actions.appendChild(shuffleBtn);
    wrap.appendChild(actions);

    this.scoreEl = document.createElement('div');
    this.scoreEl.className = 'bo-score';
    wrap.appendChild(this.scoreEl);

    this.el.appendChild(wrap);
    this._newGame();
  };

  Game.prototype._newGame = function () {
    var md = this.data.modes[this.mode];
    this.order    = shuffle(md.belts.slice());
    this.selected = null;
    this.checkBtn.disabled = false;

    var sub = this.el.querySelector('#bo-sub');
    if (sub) sub.textContent = md.description;

    var ov = this.stage.querySelector('.bo-overlay');
    if (ov) ov.remove();

    this._renderLane();
    this._setHint(false);
    this._renderScore();
  };

  Game.prototype._renderLane = function () {
    var self = this;
    var old = this.stage.querySelector('.bo-lane');
    if (old) old.remove();

    var lane = document.createElement('div');
    lane.className = 'bo-lane';
    this.lane = lane;

    this.order.forEach(function(belt, idx) {
      lane.appendChild(self._makeCard(belt, idx));
    });

    this.stage.insertBefore(lane, this.stage.firstChild);

    if (isTouch()) {
      this._bindTap(lane);
    } else {
      this._bindDrag(lane);
    }
  };

  Game.prototype._makeCard = function (belt, idx) {
    var card = document.createElement('div');
    card.className = 'bo-card';
    card.dataset.idx = idx;

    var img = document.createElement('img');
    img.className = 'bo-card-img';
    img.src = ASSET_BASE + belt.image;
    img.alt = belt.label;
    img.draggable = false;

    var lbl = document.createElement('span');
    lbl.className = 'bo-card-label';
    lbl.textContent = belt.label;

    var badge = document.createElement('span');
    badge.className = 'bo-rank-badge';
    badge.textContent = '#' + (idx + 1);

    card.appendChild(img);
    card.appendChild(lbl);
    card.appendChild(badge);
    return card;
  };

  /* ── Touch: tap-select → tap-place ─────────────────────────────────────── */
  Game.prototype._bindTap = function (lane) {
    var self = this;
    lane.addEventListener('click', function (e) {
      var card = e.target.closest('.bo-card');
      if (!card) return;
      var idx = parseInt(card.dataset.idx, 10);

      if (self.selected === null) {
        // First tap: select
        self.selected = idx;
        self._highlightTap(lane);
        self._setHint(true);
      } else if (self.selected === idx) {
        // Tapped same: deselect
        self.selected = null;
        self._highlightTap(lane);
        self._setHint(false);
      } else {
        // Second tap: swap
        self._swap(self.selected, idx);
        self.selected = null;
      }
    });
  };

  Game.prototype._highlightTap = function (lane) {
    var self = this;
    lane.querySelectorAll('.bo-card').forEach(function(c) {
      var i = parseInt(c.dataset.idx, 10);
      c.classList.remove('touch-selected', 'touch-target');
      if (self.selected === null) return;
      if (i === self.selected) c.classList.add('touch-selected');
      else c.classList.add('touch-target');
    });
  };

  Game.prototype._setHint = function (selecting) {
    if (!this.hint) return;
    if (isTouch()) {
      if (selecting) {
        this.hint.textContent = 'Now tap where you want to place it';
        this.hint.classList.add('active');
      } else {
        this.hint.textContent = 'Tap a belt to select it, then tap where to place it';
        this.hint.classList.remove('active');
      }
    } else {
      this.hint.textContent = 'Drag the belts into the correct order';
      this.hint.classList.remove('active');
    }
  };

  /* ── Mouse: drag with ghost ─────────────────────────────────────────────── */
  Game.prototype._bindDrag = function (lane) {
    var self = this;
    lane.querySelectorAll('.bo-card').forEach(function(card) {
      card.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        var srcIdx = parseInt(card.dataset.idx, 10);
        self.dragIdx = srcIdx;
        card.classList.add('dragging');

        // Ghost
        var ghost = document.createElement('div');
        ghost.className = 'bo-drag-ghost';
        ghost.style.width = card.offsetWidth + 'px';
        var gimg = document.createElement('img');
        gimg.className = 'bo-card-img';
        gimg.src = ASSET_BASE + self.order[srcIdx].image;
        gimg.alt = self.order[srcIdx].label;
        var glbl = document.createElement('span');
        glbl.className = 'bo-card-label';
        glbl.textContent = self.order[srcIdx].label;
        ghost.appendChild(gimg);
        ghost.appendChild(glbl);
        document.body.appendChild(ghost);
        self.ghost = ghost;

        function pos(x, y) {
          ghost.style.left = (x - ghost.offsetWidth / 2) + 'px';
          ghost.style.top  = (y - ghost.offsetHeight / 2) + 'px';
        }
        pos(e.clientX, e.clientY);

        function onMove(ev) {
          pos(ev.clientX, ev.clientY);
          lane.querySelectorAll('.bo-card').forEach(function(c){ c.classList.remove('touch-target'); });
          var hit = document.elementFromPoint(ev.clientX, ev.clientY);
          var tc = hit && hit.closest('.bo-card');
          if (tc && tc !== card) tc.classList.add('touch-target');
        }

        function onUp(ev) {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          ghost.remove(); self.ghost = null;
          lane.querySelectorAll('.bo-card').forEach(function(c){ c.classList.remove('dragging','touch-target'); });

          var hit = document.elementFromPoint(ev.clientX, ev.clientY);
          var tc = hit && hit.closest('.bo-card');
          if (tc) {
            var destIdx = parseInt(tc.dataset.idx, 10);
            if (destIdx !== srcIdx) self._swap(srcIdx, destIdx);
          }
          self.dragIdx = null;
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        e.preventDefault();
      });
    });
  };

  /* ── Swap ───────────────────────────────────────────────────────────────── */
  Game.prototype._swap = function (a, b) {
    var tmp = this.order[a];
    this.order[a] = this.order[b];
    this.order[b] = tmp;
    this._renderLane();
    this._setHint(false);
  };

  /* ── Check ──────────────────────────────────────────────────────────────── */
  Game.prototype._check = function () {
    this.attempts++;
    var correct = this.data.modes[this.mode].belts;
    var self = this;
    var allOk = true;

    this.lane.querySelectorAll('.bo-card').forEach(function(card, i) {
      var ok = self.order[i].id === correct[i].id;
      card.classList.remove('correct','incorrect','touch-selected','touch-target');
      card.classList.add(ok ? 'correct' : 'incorrect');
      var badge = card.querySelector('.bo-rank-badge');
      badge.classList.remove('ok','bad');
      if (ok) { badge.textContent = '✓ ' + (i+1); badge.classList.add('ok'); }
      else    { badge.textContent = '✗ ' + (i+1); badge.classList.add('bad'); allOk = false; }
    });

    this._renderScore();
    if (allOk) { this.wins++; this._renderScore(); setTimeout(function(){ self._showWin(); }, 400); }
  };

  Game.prototype._showWin = function () {
    var self = this;
    var md = this.data.modes[this.mode];
    var ov = document.createElement('div');
    ov.className = 'bo-overlay';
    var imgs = md.belts.map(function(b){ return '<img src="'+ASSET_BASE+b.image+'" alt="'+b.label+'">'; }).join('');
    ov.innerHTML = '<h2>🏆 Nice Work!</h2><p>You got the belts in the right order!<br>Keep training and you\'ll earn them all.</p><div class="bo-overlay-belts">'+imgs+'</div>';
    var btn = document.createElement('button');
    btn.className = 'bo-btn bo-btn-check';
    btn.textContent = 'Play Again';
    btn.addEventListener('click', function(){ ov.remove(); self._newGame(); });
    ov.appendChild(btn);
    this.stage.appendChild(ov);
    this.checkBtn.disabled = true;
  };

  Game.prototype._renderScore = function () {
    if (this.scoreEl) {
      this.scoreEl.textContent = this.attempts > 0
        ? 'Wins: ' + this.wins + '  ·  Attempts: ' + this.attempts : '';
    }
  };

  /* ─── Mount API ─────────────────────────────────────────────────────────── */
  function mount(el, config) {
    var url = (config && config.dataUrl) ? config.dataUrl : DATA_URL;
    fetch(url)
      .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(data){ new Game(el, data); })
      .catch(function(err){
        el.innerHTML = '<p style="color:#c00;padding:1rem">Belt Order: could not load data. ' + err.message + '</p>';
      });
  }

  global.JJGames = global.JJGames || {};
  global.JJGames['belt-order'] = { mount: mount };

}(window));