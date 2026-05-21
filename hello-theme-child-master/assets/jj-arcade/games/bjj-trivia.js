/* ==========================================================================
   bjj-trivia.js — GB Trivia Quiz
   JJA-022 · Gracie Barra Lake Country · Jiu-Jitsu Arcade
   Version: 4.0.1 — CT-002 Time Attack Mode polish

   Assets confirmed live on IONOS:
     /assets/jj-arcade/cards/gb-trenell.webp
     /assets/jj-arcade/cards/gb_academy.webp
     /assets/jj-arcade/data/trivia-kids.json
     /assets/jj-arcade/data/trivia-adult.json

   Module: window.JJGames['trivia']
   ========================================================================== */

(function () {
  'use strict';

  /* ── PATHS ──────────────────────────────────────────────────────────────── */

  /* Resolve child theme URI — tries window.CHILD_URI (set by template inline script),
     then JJ_ARCADE_CONFIG (set by arcade router), then falls back to absolute path. */
  var CHILD_URI = (function () {
    if (window.CHILD_URI && window.CHILD_URI.length > 1) return window.CHILD_URI;
    var cfg = window.JJ_ARCADE_CONFIG;
    if (cfg && cfg.cardFront) {
      /* cardFront = CHILD_URI + '/assets/jj-arcade/cards/jj-card-junior-1.png' */
      return cfg.cardFront.replace('/assets/jj-arcade/cards/jj-card-junior-1.png', '');
    }
    /* Hard fallback — works for GB Lake Country IONOS deployment */
    return '/wp-content/themes/hello-theme-child-master';
  })();

  var DATA  = CHILD_URI + '/assets/jj-arcade/data/';
  var CARDS = CHILD_URI + '/assets/jj-arcade/cards/';

  var IMG = {
    academy : CARDS + 'gb_academy.webp',
    coach        : CARDS + 'gb-trenell.webp',
    coachNice    : CARDS + 'gb-trenell-nice.webp',
    coachGoodTry : CARDS + 'gb-trenell-good-try.webp'
  };

  /* ── CONFIG ─────────────────────────────────────────────────────────────── */

  var CFG = {
    questionsPerSession : 10,
    autoAdvanceMs       : 1900,
    kidsAutoAdvanceMs   : 2800,
    pointsPerCorrect    : 10,
    timeAttackSeconds   : 60,
    timeAttackCorrect   : 100,
    timeAttackFastBonus : 25,
    timeAttackStreak3   : 50,
    timeAttackStreak5   : 100,
    defaultMode         : 'kids',
    twBaseMs            : 32,
    twJitterMs          : 18,

    categories: [
      { id:'all',         label:'All Questions', short:'ALL'  },
      { id:'gb-culture',  label:'GB Culture',    short:'GB'   },
      { id:'belt-system', label:'Belt System',   short:'BELT' },
      { id:'techniques',  label:'Techniques',    short:'TECH' },
      { id:'positions',   label:'Positions',     short:'POS'  },
      { id:'history',     label:'History',       short:'HIST' }
    ],

    belts: {
      kids: [
        { min:0, belt:'White',  label:'White Belt Explorer',  color:'#e5e7eb', tc:'#1f2937', msg:'Everyone starts here. Keep training and keep showing up!' },
        { min:3, belt:'Yellow', label:'Yellow Belt Student',  color:'#facc15', tc:'#713f12', msg:'Nice work! You\'re building your Jiu-Jitsu foundation.' },
        { min:5, belt:'Orange', label:'Orange Belt Warrior',  color:'#f97316', tc:'#ffffff', msg:'Strong score. Coach Trenell is seriously impressed!' },
        { min:7, belt:'Green',  label:'Green Belt Champion',  color:'#22c55e', tc:'#ffffff', msg:'Excellent! Professor would be very proud of that knowledge.' },
        { min:9, belt:'Blue',   label:'Blue Belt Scholar',    color:'#2563eb', tc:'#ffffff', msg:'Outstanding! You really know your Gracie Barra Jiu-Jitsu!' }
      ],
      adult: [
        { min:0, belt:'White',  label:'White Belt',  color:'#e5e7eb', tc:'#1f2937', msg:'Keep rolling. The journey starts with the fundamentals.' },
        { min:3, belt:'Blue',   label:'Blue Belt',   color:'#2563eb', tc:'#ffffff', msg:'Solid fundamentals. You understand the core concepts.' },
        { min:5, belt:'Purple', label:'Purple Belt', color:'#7c3aed', tc:'#ffffff', msg:'Strong technical knowledge. You\'re seeing the game more clearly.' },
        { min:7, belt:'Brown',  label:'Brown Belt',  color:'#92400e', tc:'#ffffff', msg:'Advanced knowledge. Sharp understanding of GB and BJJ.' },
        { min:9, belt:'Black',  label:'Black Belt',  color:'#111827', tc:'#ffffff', msg:'Elite level knowledge. Oss.' }
      ]
    },

    timeAttackRanks: [
      { min:0,    belt:'White',  label:'White Belt Thinker',        color:'#e5e7eb', tc:'#1f2937', msg:'Good start. Keep learning the basics and try again.' },
      { min:400,  belt:'Grey',   label:'Grey Belt Brain',           color:'#d1d5db', tc:'#111827', msg:'Nice work. You are starting to recognize key Jiu-Jitsu ideas.' },
      { min:800,  belt:'Blue',   label:'Blue Belt Mindset',         color:'#2563eb', tc:'#ffffff', msg:'Strong focus. You know your positions, culture, and techniques.' },
      { min:1300, belt:'Purple', label:'Purple Belt Problem Solver', color:'#7c3aed', tc:'#ffffff', msg:'Excellent. You are thinking like a real grappler.' },
      { min:1800, belt:'Black',  label:'Black Belt Brain',          color:'#111827', tc:'#ffffff', msg:'Outstanding. Coach Trenell is seriously impressed.' }
    ]
  };

  /* ── STATE ───────────────────────────────────────────────────────────────── */

  var S = {
    mode    : CFG.defaultMode,
    cat     : 'all',
    allQ    : [],
    session : [],
    idx     : 0,
    score   : 0,
    answered: false,
    phase   : 'select',
    challenge: 'classic',
    timeLeft : 0,
    timerT   : null,
    deadline : 0,
    totalAnswered: 0,
    correctCount : 0,
    streak       : 0,
    bestStreak   : 0,
    questionStart: 0,
    advT    : null,
    typeT   : null
  };

  /* ── UTILITIES ───────────────────────────────────────────────────────────── */

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function lsKey()      { return 'jja_trivia_' + S.challenge + '_' + S.mode + '_' + S.cat; }
  function getHS()      { try { return parseInt(localStorage.getItem(lsKey()) || '0', 10); } catch(e) { return 0; } }
  function setHS(v)     { try { localStorage.setItem(lsKey(), v); } catch(e) {} }

  function getBelt(score) {
    var ranks = S.challenge === 'timeAttack' ? CFG.timeAttackRanks : (CFG.belts[S.mode] || CFG.belts.kids);
    for (var i = ranks.length - 1; i >= 0; i--) { if (score >= ranks[i].min) return ranks[i]; }
    return ranks[0];
  }

  function isTimeAttack() { return S.challenge === 'timeAttack'; }

  function fmtTime(sec) {
    sec = Math.max(0, parseInt(sec || 0, 10));
    return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
  }

  function getTAKey() { return 'jja_trivia_ta_best_' + S.mode + '_' + S.cat; }
  function getTABest() { try { return parseInt(localStorage.getItem(getTAKey()) || '0', 10); } catch(e) { return 0; } }
  function setTABest(v) { try { localStorage.setItem(getTAKey(), v); } catch(e) {} }

  function coachLine(kind) {
    var lines = {
      correct: ['Nice!', 'Great answer!', 'Coach Trenell approves!', 'Sharp Jiu-Jitsu brain!', 'That is correct!'],
      wrong: ['Good try!', 'Keep going!', 'That one was tricky!', 'Stay focused!', 'Shake it off!'],
      pressure: ['Final seconds!', 'Quick thinking!', 'Last push!', 'Keep answering!', 'Do not stop now!']
    };
    var pool = lines[kind] || lines.correct;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function getCat(id) {
    for (var i = 0; i < CFG.categories.length; i++) { if (CFG.categories[i].id === id) return CFG.categories[i]; }
    return CFG.categories[0];
  }

  function getPool() {
    return S.cat === 'all' ? S.allQ : S.allQ.filter(function(q) { return q.category === S.cat; });
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls)             e.className   = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function clearT() {
    if (S.advT)  { clearTimeout(S.advT);  S.advT  = null; }
    if (S.typeT) { clearTimeout(S.typeT); S.typeT = null; }
    if (S.timerT) { clearInterval(S.timerT); S.timerT = null; }
  }

  /* ── TYPEWRITER ──────────────────────────────────────────────────────────── */

  function typewrite(textNode, cursorEl, coachEl, dotsEl, micEl, answersEl, tapHintEl, text, onDone) {
    var chars = text.split('');
    var i = 0;
    textNode.nodeValue = '';

    if (coachEl) coachEl.classList.add('jjt-speaking');
    if (dotsEl)  dotsEl.classList.add('jjt-dots--show');
    if (micEl)   micEl.classList.add('jjt-mic--show');

    function delay(ch) {
      if (ch === ' ')                            return 26;
      if (ch === ',' || ch === ';')              return 110;
      if (ch === '.' || ch === '?' || ch === '!') return 140;
      return CFG.twBaseMs + Math.random() * CFG.twJitterMs;
    }

    function tick() {
      if (i >= chars.length) {
        if (coachEl) coachEl.classList.remove('jjt-speaking');
        if (dotsEl)  dotsEl.classList.remove('jjt-dots--show');
        if (micEl)   micEl.classList.remove('jjt-mic--show');
        if (cursorEl) cursorEl.classList.add('jjt-cursor--hidden');
        setTimeout(function() {
          if (answersEl) answersEl.classList.add('jjt-answers--visible');
          if (tapHintEl) tapHintEl.classList.add('jjt-hint--show');
          if (typeof onDone === 'function') onDone();
        }, 160);
        return;
      }
      textNode.nodeValue += chars[i];
      i++;
      S.typeT = setTimeout(tick, delay(chars[i - 1]));
    }
    tick();
  }

  /* ── CSS INJECTION ───────────────────────────────────────────────────────── */

  function injectStyles() {
    if (document.getElementById('jja-trivia-styles')) return;
    var s = document.createElement('style');
    s.id  = 'jja-trivia-styles';
    s.textContent = [
      /* base */
      '.jjt{width:100%;max-width:940px;margin:0 auto;padding:20px 16px 40px;font-family:\'Barlow\',\'Segoe UI\',system-ui,sans-serif;color:#171717;}',
      '.jjt *{box-sizing:border-box;}',
      /* select layout */
      '.jjt-select{display:grid;grid-template-columns:1fr 420px;gap:20px;align-items:stretch;}',
      /* hero */
      '.jjt-hero{position:relative;border-radius:22px;overflow:hidden;min-height:460px;background:radial-gradient(circle at 22% 18%,rgba(255,255,255,.12),transparent 34%),linear-gradient(135deg,#111827 0%,#1c2840 48%,#C8102E 100%);display:flex;flex-direction:column;justify-content:flex-end;padding:30px;}',
      '.jjt-hero::before{content:\'\';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 55%);}',
      '.jjt-hero::after{content:\'TRIVIA\';position:absolute;right:-10px;top:26px;font-family:\'Barlow Condensed\',sans-serif;font-size:116px;font-weight:900;color:rgba(255,255,255,.05);letter-spacing:-.04em;pointer-events:none;}',
      '.jjt-badge{position:relative;z-index:1;display:inline-flex;align-self:flex-start;background:#C8102E;color:#fff;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;padding:5px 12px;border-radius:999px;margin-bottom:14px;}',
      '.jjt-title{position:relative;z-index:1;font-family:\'Barlow Condensed\',sans-serif;font-size:clamp(44px,7vw,80px);font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:-.02em;line-height:.9;margin:0 0 12px;}',
      '.jjt-title span{color:#ff2347;}',
      '.jjt-sub{position:relative;z-index:1;font-size:15px;font-weight:600;color:rgba(255,255,255,.8);line-height:1.5;max-width:360px;margin:0;}',
      /* panel */
      '.jjt-panel{background:#fff;border:1px solid #e5e7eb;border-radius:22px;padding:20px;box-shadow:0 18px 48px rgba(0,0,0,.1);display:flex;flex-direction:column;}',
      '.jjt-lbl{font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#9ca3af;margin:14px 0 8px;}',
      '.jjt-lbl:first-child{margin-top:0;}',
      /* mode */
      '.jjt-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}',
      '.jjt-mode-btn{border:2px solid #e5e7eb;border-radius:14px;background:#f9fafb;padding:11px 10px;text-align:left;cursor:pointer;transition:all .18s ease;font-family:inherit;}',
      '.jjt-mode-btn:hover{border-color:#C8102E;transform:translateY(-2px);box-shadow:0 8px 18px rgba(200,16,46,.11);}',
      '.jjt-mode-btn.active{border-color:#C8102E;background:#fff5f6;color:#C8102E;}',
      '.jjt-mode-btn strong{display:block;font-size:13px;font-weight:800;margin-bottom:2px;}',
      '.jjt-mode-btn small{display:block;font-size:11px;font-weight:600;color:#9ca3af;}',
      '.jjt-mode-btn.active small{color:#be123c;}',
      '.jjt-mode-hint{font-size:12px;color:#6b7280;font-weight:600;line-height:1.4;margin-top:7px;}',
      /* categories */
      '.jjt-cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}',
      '.jjt-cat-card{border:1.5px solid #e5e7eb;border-radius:14px;background:linear-gradient(180deg,#fff,#fafafa);padding:12px 10px;text-align:left;cursor:pointer;transition:all .18s ease;font-family:inherit;box-shadow:0 4px 10px rgba(0,0,0,.04);}',
      '.jjt-cat-card:hover{border-color:#C8102E;transform:translateY(-2px);box-shadow:0 10px 20px rgba(200,16,46,.1);}',
      '.jjt-cat-card.active{border-color:#C8102E;background:linear-gradient(180deg,#fff5f6,#fff);}',
      '.jjt-cat-pip{display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:22px;background:#111827;color:#fff;border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.06em;margin-bottom:7px;}',
      '.jjt-cat-card.active .jjt-cat-pip{background:#C8102E;}',
      '.jjt-cat-name{font-size:12px;font-weight:800;color:#171717;line-height:1.25;}',
      '.jjt-cat-meta{font-size:10px;color:#9ca3af;font-weight:700;margin-top:3px;}',
      /* start btn */
      '.jjt-start{width:100%;margin-top:14px;border:none;border-radius:14px;background:#C8102E;color:#fff;font-family:\'Barlow Condensed\',sans-serif;font-size:20px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;padding:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 12px 30px rgba(200,16,46,.3);transition:all .18s ease;}',
      '.jjt-start:hover{background:#9e0c23;transform:translateY(-2px);box-shadow:0 18px 38px rgba(200,16,46,.4);}',
      /* HUD */
      '.jjt-hud{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;}',
      '.jjt-hud-card{background:#fff;border:1px solid #e5e7eb;border-radius:13px;padding:10px 12px;box-shadow:0 4px 10px rgba(0,0,0,.04);}',
      '.jjt-hud-lbl{font-size:9px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#9ca3af;display:block;margin-bottom:3px;}',
      '.jjt-hud-val{font-family:\'Barlow Condensed\',sans-serif;font-size:17px;font-weight:900;color:#171717;display:block;}',
      '.jjt-hud-score{color:#C8102E;}',
      /* progress */
      '.jjt-prog{height:6px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-bottom:14px;}',
      '.jjt-prog-bar{height:100%;background:linear-gradient(90deg,#C8102E,#ff3154);border-radius:999px;transition:width .42s cubic-bezier(.4,0,.2,1);}',
      /* kids scene */
      '.jjt-scene{position:relative;border-radius:22px;overflow:hidden;margin-bottom:14px;min-height:390px;background:#12395d;box-shadow:0 20px 50px rgba(0,0,0,.18);border:1.5px solid rgba(255,255,255,.18);}',
      '.jjt-scene-bg{position:absolute;inset:0;background-size:cover;background-position:center;}',
      '.jjt-scene-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,22,38,.04),rgba(255,255,255,.03) 45%,rgba(7,22,38,.14));}',
      /* coach */
      '.jjt-coach-wrap{position:absolute;left:26px;bottom:0;width:210px;max-width:32%;z-index:3;}',
      '.jjt-coach{display:block;width:100%;height:auto;filter:drop-shadow(0 12px 16px rgba(0,0,0,.32));transform-origin:bottom center;animation:jjt-idle 3.2s ease-in-out infinite;}',
      '.jjt-coach.jjt-speaking{animation:jjt-speak .38s ease-in-out infinite alternate;}',
      '@keyframes jjt-idle{0%,100%{transform:translateY(0) rotate(0deg)}30%{transform:translateY(-5px) rotate(.4deg)}65%{transform:translateY(-3px) rotate(-.3deg)}}',
      '@keyframes jjt-speak{from{transform:translateY(0) rotate(-.5deg) scale(1)}to{transform:translateY(-4px) rotate(.5deg) scale(1.015)}}',
      /* dots */
      '.jjt-dots{display:flex;gap:4px;justify-content:center;margin-top:4px;height:16px;opacity:0;transition:opacity .2s;}',
      '.jjt-dots--show{opacity:1;}',
      '.jjt-dots span{width:7px;height:7px;border-radius:50%;background:#fff;animation:jjt-dot .6s ease-in-out infinite;}',
      '.jjt-dots span:nth-child(2){animation-delay:.12s;}',
      '.jjt-dots span:nth-child(3){animation-delay:.24s;}',
      '@keyframes jjt-dot{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-5px);opacity:1}}',
      /* bubble */
      '.jjt-bubble{position:absolute;left:258px;right:20px;top:28px;background:#fff;border-radius:24px 24px 24px 6px;padding:20px 22px 16px;box-shadow:0 12px 32px rgba(0,0,0,.14),0 2px 6px rgba(0,0,0,.08);z-index:4;border:2px solid rgba(255,255,255,.6);min-height:110px;display:flex;flex-direction:column;justify-content:space-between;}',
      '.jjt-bubble::before{content:\'\';position:absolute;left:-18px;bottom:26px;width:0;height:0;border-top:10px solid transparent;border-bottom:10px solid transparent;border-right:20px solid rgba(255,255,255,.6);}',
      '.jjt-bubble::after{content:\'\';position:absolute;left:-14px;bottom:28px;width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-right:16px solid #fff;}',
      '.jjt-speaker{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.16em;color:#C8102E;margin-bottom:8px;display:flex;align-items:center;gap:6px;}',
      '.jjt-mic{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#C8102E;font-size:10px;opacity:0;transition:opacity .2s;flex-shrink:0;}',
      '.jjt-mic--show{opacity:1;animation:jjt-mic-pulse 1s ease-in-out infinite;}',
      '@keyframes jjt-mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,16,46,.5)}50%{box-shadow:0 0 0 5px rgba(200,16,46,0)}}',
      '.jjt-qtext{font-family:\'Nunito\',\'Barlow\',sans-serif;font-size:clamp(17px,2.6vw,25px);font-weight:800;color:#111;line-height:1.26;margin:0;min-height:2.4em;}',
      '.jjt-cursor{display:inline-block;width:2px;height:1.1em;background:#C8102E;margin-left:2px;vertical-align:text-bottom;border-radius:1px;animation:jjt-blink .52s ease-in-out infinite;}',
      '.jjt-cursor--hidden{display:none;}',
      '@keyframes jjt-blink{0%,100%{opacity:1}50%{opacity:0}}',
      '.jjt-tap-hint{font-size:11px;font-weight:700;color:#9ca3af;margin-top:10px;text-align:right;letter-spacing:.04em;opacity:0;transition:opacity .35s ease;}',
      '.jjt-hint--show{opacity:1;}',
      /* adult stage — Professor Andar + dark question card */
      '.jjt-adult-stage{display:grid;grid-template-columns:240px 1fr;gap:0;margin-bottom:14px;border-radius:20px;overflow:hidden;box-shadow:0 18px 44px rgba(0,0,0,.28);min-height:340px;}',
      '.jjt-prof-panel{background:#000;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative;overflow:hidden;}',
      '.jjt-prof-video{width:100%;height:100%;object-fit:contain;object-position:center bottom;display:block;position:absolute;inset:0;background:#000;}',
      '.jjt-prof-panel.celebrate{animation:jjt-prof-glow .7s ease-out;}',
      '@keyframes jjt-prof-glow{0%{box-shadow:inset 0 0 0 0 rgba(200,16,46,0)}40%{box-shadow:inset 0 0 50px 10px rgba(200,16,46,.55)}100%{box-shadow:inset 0 0 0 0 rgba(200,16,46,0)}}',
      '.jjt-prof-label{position:absolute;bottom:0;left:0;right:0;z-index:2;background:linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 100%);padding:16px 10px 10px;text-align:center;}',
      '.jjt-prof-name{font-family:\'Barlow Condensed\',sans-serif;font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.9);display:block;}',
      '.jjt-prof-rank{font-size:10px;font-weight:700;color:rgba(255,255,255,.45);letter-spacing:.06em;}',
      '.jjt-adult-card{position:relative;overflow:hidden;background:linear-gradient(135deg,#111827 0%,#1c2535 100%);padding:24px 22px;display:flex;flex-direction:column;justify-content:center;}',
      '.jjt-adult-card::after{content:\'\';position:absolute;right:-55px;top:-55px;width:160px;height:160px;border-radius:50%;background:rgba(200,16,46,.2);}',
      '.jjt-adult-kicker{position:relative;z-index:1;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.16em;color:#ff3154;margin-bottom:10px;}',
      '.jjt-adult-q{position:relative;z-index:1;font-family:\'Nunito\',\'Barlow\',sans-serif;font-size:clamp(17px,2.3vw,23px);font-weight:800;color:#fff;line-height:1.28;margin:0;}',
      /* answers */
      '.jjt-answers{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;opacity:0;transform:translateY(7px);transition:opacity .32s ease,transform .32s ease;}',
      '.jjt-answers--visible{opacity:1;transform:translateY(0);}',
      '.jjt-ans{width:100%;min-height:56px;display:flex;align-items:center;gap:10px;text-align:left;border:2px solid #e5e7eb;border-radius:14px;background:#fff;padding:11px 13px;font-family:inherit;font-size:14px;font-weight:700;color:#171717;cursor:pointer;transition:all .15s ease;line-height:1.35;box-shadow:0 5px 12px rgba(0,0,0,.05);}',
      '.jjt-ans:nth-child(1){transition-delay:.02s;}',
      '.jjt-ans:nth-child(2){transition-delay:.06s;}',
      '.jjt-ans:nth-child(3){transition-delay:.10s;}',
      '.jjt-ans:nth-child(4){transition-delay:.14s;}',
      /* Hover: soft pink bg + dark text — only the letter pip goes red for the red accent */
      '.jjt-ans:hover:not(:disabled){border-color:#C8102E;background:#fff0f2;color:#111;transform:translateY(-2px);box-shadow:0 10px 20px rgba(200,16,46,.11);}',
      '.jjt-ans-letter{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;min-width:28px;border-radius:50%;background:#f3f4f6;color:#6b7280;font-size:12px;font-weight:900;transition:all .15s;flex-shrink:0;}',
      '.jjt-ans:hover:not(:disabled) .jjt-ans-letter{background:#C8102E;color:#fff;}',
      '.jjt-ans:disabled{cursor:default;transform:none!important;}',
      '.jjt-ans.correct{border-color:#16a34a!important;background:#f0fdf4!important;color:#14532d!important;}',
      '.jjt-ans.correct .jjt-ans-letter{background:#16a34a;color:#fff;}',
      '.jjt-ans.wrong{border-color:#C8102E!important;background:#fff1f2!important;color:#9f1239!important;}',
      '.jjt-ans.wrong .jjt-ans-letter{background:#C8102E;color:#fff;}',
      '.jjt-ans.dimmed{opacity:.38;}',
      /* explanation */
      '.jjt-expl{border-radius:13px;padding:11px 14px;font-size:13px;font-weight:700;line-height:1.55;margin-bottom:10px;display:none;}',
      '.jjt-expl.show{display:block;}',
      '.jjt-expl.correct{background:#f0fdf4;color:#14532d;border:1px solid #bbf7d0;}',
      '.jjt-expl.wrong{background:#fff1f2;color:#991b1b;border:1px solid #fecdd3;}',
      /* util */
      '.jjt-util{display:flex;justify-content:center;margin-top:8px;}',
      '.jjt-back{border:none;background:#f3f4f6;color:#6b7280;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:800;font-family:inherit;cursor:pointer;transition:all .18s ease;}',
      '.jjt-back:hover{background:#e5e7eb;color:#111;}',
      /* flash */
      '.jjt-flash{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);font-family:\'Barlow Condensed\',sans-serif;font-size:62px;font-weight:900;color:#16a34a;pointer-events:none;z-index:9999;animation:jjt-flash .8s ease-out forwards;text-shadow:0 8px 20px rgba(22,163,74,.3);}',
      '@keyframes jjt-flash{0%{opacity:1;transform:translate(-50%,-50%) scale(.65)}30%{opacity:1;transform:translate(-50%,-63%) scale(1.13)}100%{opacity:0;transform:translate(-50%,-90%) scale(.92)}}',
      /* results */
      '.jjt-results{max-width:600px;margin:0 auto;}',
      '.jjt-res-card{background:#fff;border:1px solid #e5e7eb;border-radius:26px;padding:26px;box-shadow:0 20px 56px rgba(0,0,0,.11);text-align:center;}',
      '.jjt-res-kicker{display:inline-flex;background:#111827;color:#fff;font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;padding:6px 12px;border-radius:999px;margin-bottom:14px;}',
      '.jjt-belt-strip{border-radius:16px;padding:15px;margin-bottom:13px;box-shadow:inset 0 -5px 0 rgba(0,0,0,.1);}',
      '.jjt-belt-name{font-family:\'Barlow Condensed\',sans-serif;font-size:24px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;}',
      '.jjt-rank-lbl{font-family:\'Barlow Condensed\',sans-serif;font-size:28px;font-weight:900;color:#171717;margin-bottom:6px;}',
      '.jjt-rank-msg{font-size:14px;font-weight:600;color:#6b7280;line-height:1.55;max-width:400px;margin:0 auto 18px;}',
      '.jjt-score-wrap{background:linear-gradient(180deg,#fff,#f9fafb);border:1px solid #e5e7eb;border-radius:20px;padding:20px;margin-bottom:16px;}',
      '.jjt-final{font-family:\'Barlow Condensed\',sans-serif;font-size:68px;font-weight:900;color:#C8102E;line-height:.9;letter-spacing:-.04em;}',
      '.jjt-final span{font-size:26px;color:#9ca3af;}',
      '.jjt-final-lbl{font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-top:6px;}',
      '.jjt-new-best{display:inline-flex;background:#fef3c7;color:#92400e;border:1px solid #fde68a;font-size:12px;font-weight:900;padding:5px 12px;border-radius:999px;margin-top:10px;}',
      '.jjt-prev-best{font-size:12px;color:#9ca3af;font-weight:700;margin-top:10px;}',
      '.jjt-res-copy{font-size:14px;font-weight:600;color:#374151;line-height:1.55;max-width:460px;margin:0 auto 18px;}',
      '.jjt-res-btns{display:flex;flex-direction:column;gap:8px;}',
      '.jjt-r-btn{width:100%;border:none;border-radius:13px;padding:13px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;transition:all .18s ease;text-decoration:none;display:flex;align-items:center;justify-content:center;}',
      '.jjt-r-btn.primary{background:#C8102E;color:#fff;box-shadow:0 10px 26px rgba(200,16,46,.26);}',
      '.jjt-r-btn.primary:hover{background:#9e0c23;transform:translateY(-2px);}',
      '.jjt-r-btn.secondary{background:#f3f4f6;color:#171717;}',
      '.jjt-r-btn.secondary:hover{background:#e5e7eb;transform:translateY(-1px);}',
      '.jjt-r-btn.trial{background:#111827;color:#fff;}',
      '.jjt-r-btn.trial:hover{background:#000;transform:translateY(-2px);}',

      /* time attack */
      '.jjt-challenge-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:2px;}',
      '.jjt-challenge-btn{border:2px solid #e5e7eb;border-radius:14px;background:#f9fafb;padding:12px 10px;text-align:left;cursor:pointer;transition:all .18s ease;font-family:inherit;}',
      '.jjt-challenge-btn:hover{border-color:#C8102E;transform:translateY(-2px);box-shadow:0 8px 18px rgba(200,16,46,.11);}',
      '.jjt-challenge-btn.active{border-color:#C8102E;background:#fff5f6;color:#C8102E;}',
      '.jjt-challenge-btn strong{display:block;font-size:13px;font-weight:900;margin-bottom:2px;}',
      '.jjt-challenge-btn small{display:block;font-size:11px;font-weight:700;color:#9ca3af;line-height:1.25;}',
      '.jjt-challenge-btn.active small{color:#be123c;}',
      '.jjt-hud--ta{grid-template-columns:1fr 1fr 1fr 1fr;}',
      '.jjt-time-val{color:#111827;}',
      '.jjt-time-val.low{color:#C8102E;animation:jjt-timer-pulse .65s ease-in-out infinite;}',
      '@keyframes jjt-timer-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}',
      '.jjt-timebar{height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin:-3px 0 14px;}',
      '.jjt-timebar-fill{height:100%;width:100%;background:linear-gradient(90deg,#16a34a,#facc15,#C8102E);border-radius:999px;transition:width .25s linear;}',
      '.jjt-feedback-pill{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);z-index:6;background:#fff;color:#111827;border:2px solid rgba(255,255,255,.75);border-radius:999px;padding:8px 14px;font-size:13px;font-weight:900;box-shadow:0 10px 24px rgba(0,0,0,.18);opacity:0;pointer-events:none;}',
      '.jjt-feedback-pill.show{animation:jjt-pill-pop .7s ease-out forwards;}',
      '@keyframes jjt-pill-pop{0%{opacity:0;transform:translateX(-50%) translateY(8px) scale(.9)}20%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.04)}80%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-8px) scale(.98)}}',
      '.jjt-ta-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0 16px;}',
      '.jjt-ta-stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:10px;}',
      ".jjt-ta-stat strong{display:block;font-family:\"Barlow Condensed\",sans-serif;font-size:24px;font-weight:900;color:#C8102E;line-height:1;}",
      '.jjt-ta-stat span{display:block;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-top:4px;}',
      /* responsive */
      '@media(max-width:820px){.jjt-select{grid-template-columns:1fr;}}',
      /* 700px: stack scene elements, single-col answers, constrain to viewport */
      '@media(max-width:700px){',
        '.jjt{padding:12px 8px 32px;max-width:100%;overflow-x:hidden;}',
        '.jjt-scene{min-height:480px;}',
        '.jjt-coach-wrap{left:50%;transform:translateX(-50%);width:140px;max-width:55%;}',
        '.jjt-bubble{left:8px;right:8px;top:10px;border-radius:18px;padding:16px 16px 12px;}',
        '.jjt-bubble::before,.jjt-bubble::after{display:none;}',
        '.jjt-qtext{font-size:17px;}',
        '.jjt-hud{grid-template-columns:1fr 1fr;}',
        '.jjt-hud--ta{grid-template-columns:1fr 1fr;}',
        '.jjt-hud-card:nth-child(2){grid-column:1/-1;}',
        '.jjt-hud--ta .jjt-hud-card:nth-child(2){grid-column:auto;}',
        '.jjt-mode-grid,.jjt-challenge-grid{grid-template-columns:1fr;}',
        /* Adult stage stacks on mobile */
        '.jjt-adult-stage{grid-template-columns:1fr;}',
        '.jjt-prof-panel{height:220px;position:relative;}',
        '.jjt-prof-video{object-fit:cover;object-position:center 18%;}',
        /* Single column answers — critical mobile fix */
        '.jjt-answers{grid-template-columns:1fr;gap:8px;}',
        /* Ensure buttons never overflow viewport */
        '.jjt-ans{width:100%;box-sizing:border-box;min-height:auto;padding:12px 12px;font-size:14px;white-space:normal;word-break:break-word;}',
      '}',
      /* 480px: tighten further */
      '@media(max-width:480px){',
        '.jjt{padding:10px 6px 28px;}',
        '.jjt-hero{min-height:250px;padding:18px;border-radius:16px;}',
        '.jjt-title{font-size:38px;}',
        '.jjt-panel{border-radius:16px;padding:14px;}',
        '.jjt-cat-grid{grid-template-columns:1fr 1fr;}',
        '.jjt-adult{padding:18px 14px;border-radius:14px;}',
        '.jjt-adult-q{font-size:17px;}',
        '.jjt-ans{font-size:13px;padding:11px 11px;}',
        '.jjt-ans-letter{width:26px;height:26px;min-width:26px;font-size:11px;}',
        '.jjt-hud-card{padding:8px 10px;}',
        '.jjt-hud-val{font-size:15px;}',
        '.jjt-scene{min-height:440px;}',
        '.jjt-final{font-size:54px;gap:7px;}','.jjt-final span{font-size:22px;margin-bottom:6px;}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── RENDER: SELECT ──────────────────────────────────────────────────────── */

  function renderSelect(container) {
    container.innerHTML = '';
    S.phase = 'select';

    var wrap  = el('div', 'jjt jjt-select');
    var hero  = el('div', 'jjt-hero');
    hero.innerHTML =
      '<div class="jjt-badge">Jiu-Jitsu Arcade</div>' +
      '<h2 class="jjt-title"><span>GB</span> Trivia Quiz</h2>' +
      '<p class="jjt-sub">' + (S.mode === 'kids'
        ? 'Coach Trenell has questions ready. Can you earn your blue belt?'
        : 'Test your Gracie Barra knowledge, BJJ terminology, and history.') + '</p>';

    var panel = el('div', 'jjt-panel');

    /* Mode */
    panel.appendChild(el('div', 'jjt-lbl', 'Mode'));
    var mg = el('div', 'jjt-mode-grid');
    ['kids','adult'].forEach(function(m) {
      var btn = el('button', 'jjt-mode-btn' + (S.mode === m ? ' active' : ''));
      btn.type = 'button';
      btn.innerHTML = '<strong>'+(m==='kids'?'Kids Mode':'Adult Mode')+'</strong>' +
        '<small>'+(m==='kids'?'Coach Trenell leads':'Technical challenge')+'</small>';
      btn.addEventListener('click', function() {
        if (S.mode === m) return;
        S.mode = m; S.cat = 'all';
        loadQuestions(function() { renderSelect(container); });
      });
      mg.appendChild(btn);
    });
    panel.appendChild(mg);

    var mh = el('p', 'jjt-mode-hint');
    mh.textContent = S.mode === 'kids'
      ? 'Coach Trenell types out each question — watch her speak!'
      : 'Full BJJ terminology, GB history, and training knowledge.';
    panel.appendChild(mh);

    /* Challenge */
    panel.appendChild(el('div', 'jjt-lbl', 'Challenge'));
    var chg = el('div', 'jjt-challenge-grid');
    [
      { id:'classic', label:'Classic Quiz', meta:'10 questions · no timer' },
      { id:'timeAttack', label:'Time Attack', meta:'60 seconds · streak bonuses' }
    ].forEach(function(ch) {
      var btn = el('button', 'jjt-challenge-btn' + (S.challenge === ch.id ? ' active' : ''));
      btn.type = 'button';
      btn.innerHTML = '<strong>'+esc(ch.label)+'</strong><small>'+esc(ch.meta)+'</small>';
      btn.addEventListener('click', function() { S.challenge = ch.id; renderSelect(container); });
      chg.appendChild(btn);
    });
    panel.appendChild(chg);

    /* Category */
    panel.appendChild(el('div', 'jjt-lbl', 'Category'));
    var cg = el('div', 'jjt-cat-grid');
    CFG.categories.forEach(function(cat) {
      var count = cat.id === 'all' ? S.allQ.length
        : S.allQ.filter(function(q) { return q.category === cat.id; }).length;
      var hs = getHS();
      var card = el('button', 'jjt-cat-card' + (S.cat === cat.id ? ' active' : ''));
      card.type = 'button';
      card.innerHTML =
        '<div class="jjt-cat-pip">'+esc(cat.short)+'</div>' +
        '<div class="jjt-cat-name">'+esc(cat.label)+'</div>' +
        '<div class="jjt-cat-meta">'+count+' qs'+(hs>0?(isTimeAttack()?' · Best '+hs+' pts':' · Best '+hs+'/10'):'')+'</div>';
      card.addEventListener('click', function() { S.cat = cat.id; renderSelect(container); });
      cg.appendChild(card);
    });
    panel.appendChild(cg);

    var sb = el('button', 'jjt-start');
    sb.type = 'button';
    sb.innerHTML = (isTimeAttack() ? 'Start Time Attack' : 'Start Quiz') + ' <strong>▶</strong>';
    sb.addEventListener('click', function() { startGame(container); });
    panel.appendChild(sb);

    wrap.appendChild(hero);
    wrap.appendChild(panel);
    container.appendChild(wrap);
  }

  /* ── START GAME ──────────────────────────────────────────────────────────── */

  function startGame(container) {
    var pool = getPool();
    if (!pool.length) { alert('No questions loaded. Verify JSON files are deployed.'); return; }
    S.session = isTimeAttack() ? shuffle(pool) : shuffle(pool).slice(0, Math.min(CFG.questionsPerSession, pool.length));
    S.idx = 0;
    S.score = 0;
    S.phase = 'game';
    S.totalAnswered = 0;
    S.correctCount = 0;
    S.streak = 0;
    S.bestStreak = 0;
    S.timeLeft = CFG.timeAttackSeconds;
    S.deadline = 0;
    renderQuestion(container);
  }


  /* ── TIME ATTACK TIMER ──────────────────────────────────────────────────── */

  function updateTimerUI(container) {
    var tv = document.getElementById('jjt-time-el');
    var tf = document.getElementById('jjt-time-fill');
    if (tv) {
      tv.textContent = fmtTime(S.timeLeft);
      if (S.timeLeft <= 10) tv.classList.add('low');
      else tv.classList.remove('low');
    }
    if (tf) tf.style.width = Math.max(0, (S.timeLeft / CFG.timeAttackSeconds) * 100) + '%';
  }

  function startTimeAttackTimer(container) {
    if (!isTimeAttack() || S.timerT) return;
    S.deadline = Date.now() + (S.timeLeft * 1000);
    updateTimerUI(container);
    S.timerT = setInterval(function() {
      S.timeLeft = Math.max(0, Math.ceil((S.deadline - Date.now()) / 1000));
      updateTimerUI(container);
      if (S.timeLeft <= 0) {
        if (S.timerT) { clearInterval(S.timerT); S.timerT = null; }
        renderResults(container);
      }
    }, 200);
  }

  function ensureTimeAttackQuestionPool() {
    if (!isTimeAttack()) return;
    if (S.idx < S.session.length) return;
    var pool = getPool();
    if (pool.length) S.session = S.session.concat(shuffle(pool));
  }

  function showFeedback(wrap, text) {
    var pill = wrap.querySelector('.jjt-feedback-pill');
    if (!pill) return;
    pill.textContent = text;
    pill.classList.remove('show');
    void pill.offsetWidth;
    pill.classList.add('show');
  }

  function setCoachImage(wrap, src) {
    var ci = wrap.querySelector('.jjt-coach');
    if (!ci || !src) return;
    ci.onerror = function() { ci.onerror = null; ci.src = IMG.coach; };
    ci.src = src;
  }

  /* ── RENDER: QUESTION ────────────────────────────────────────────────────── */

  function renderQuestion(container) {
    ensureTimeAttackQuestionPool();
    if (S.idx >= S.session.length) { renderResults(container); return; }
    if (isTimeAttack()) {
      if (S.advT) { clearTimeout(S.advT); S.advT = null; }
      if (S.typeT) { clearTimeout(S.typeT); S.typeT = null; }
    } else {
      clearT();
    }

    var q      = S.session[S.idx];
    var total  = isTimeAttack() ? CFG.timeAttackSeconds : S.session.length;
    var pct    = isTimeAttack() ? ((CFG.timeAttackSeconds - S.timeLeft) / CFG.timeAttackSeconds) * 100 : (S.idx / total) * 100;
    var catDef = getCat(q.category);
    S.answered = false;
    container.innerHTML = '';

    var wrap = el('div', 'jjt');

    /* HUD */
    var hud = el('div', 'jjt-hud' + (isTimeAttack() ? ' jjt-hud--ta' : ''));
    var hudItems = isTimeAttack()
      ? [
          {l:'Time',v:fmtTime(S.timeLeft),id:'jjt-time-el',cls:'jjt-time-val'},
          {l:'Score',v:S.score+' pts',id:'jjt-score-el',cls:'jjt-hud-score'},
          {l:'Streak',v:S.streak,id:'jjt-streak-el',cls:''},
          {l:'Answered',v:S.totalAnswered,id:'jjt-answered-el',cls:''}
        ]
      : [
          {l:'Question',v:(S.idx+1)+'/'+total,id:'',cls:''},
          {l:'Category',v:catDef.label,id:'',cls:''},
          {l:'Score',v:S.score+' pts',id:'jjt-score-el',cls:'jjt-hud-score'}
        ];
    hudItems.forEach(function(item) {
      var c = el('div','jjt-hud-card');
      c.innerHTML='<span class="jjt-hud-lbl">'+item.l+'</span><span class="jjt-hud-val '+item.cls+'"'+(item.id?' id="'+item.id+'"':'')+'>'+item.v+'</span>';
      hud.appendChild(c);
    });
    wrap.appendChild(hud);

    if (isTimeAttack()) {
      var tw = el('div','jjt-timebar');
      var tf = el('div','jjt-timebar-fill');
      tf.id = 'jjt-time-fill';
      tf.style.width = Math.max(0, (S.timeLeft / CFG.timeAttackSeconds) * 100) + '%';
      tw.appendChild(tf); wrap.appendChild(tw);
    } else {
      /* Progress */
      var pw = el('div','jjt-prog');
      var pb = el('div','jjt-prog-bar');
      pb.style.width = pct + '%';
      pw.appendChild(pb); wrap.appendChild(pw);
    }

    /* Answers (built now, hidden until typing done) */
    var indices = shuffle([0,1,2,3].slice(0, q.answers.length));
    var aw   = el('div', 'jjt-answers');
    var expl = el('div', 'jjt-expl');

    indices.forEach(function(origIdx, i) {
      var btn = el('button', 'jjt-ans');
      btn.type = 'button'; btn.dataset.idx = origIdx;
      btn.innerHTML =
        '<span class="jjt-ans-letter">'+String.fromCharCode(65+i)+'</span>' +
        '<span>'+esc(q.answers[origIdx])+'</span>';
      btn.addEventListener('click', function() {
        handleAnswer(q, origIdx, btn, aw, expl, wrap, container);
      });
      aw.appendChild(btn);
    });

    /* ── KIDS: scene + typewriter ── */
    if (S.mode === 'kids') {

      var scene = el('div', 'jjt-scene');

      var bg = el('div', 'jjt-scene-bg');
      bg.style.backgroundImage = 'url("'+IMG.academy+'")';
      scene.appendChild(bg);
      scene.appendChild(el('div', 'jjt-scene-overlay'));
      scene.appendChild(el('div', 'jjt-feedback-pill'));

      /* Coach */
      var cw  = el('div', 'jjt-coach-wrap');
      var ci  = el('img', 'jjt-coach');
      ci.src  = IMG.coach; ci.alt = 'Coach Trenell';
      ci.onerror = function() { cw.style.display = 'none'; };
      var dots = el('div', 'jjt-dots');
      for (var d = 0; d < 3; d++) dots.appendChild(document.createElement('span'));
      cw.appendChild(ci); cw.appendChild(dots); scene.appendChild(cw);

      /* Bubble */
      var bubble = el('div', 'jjt-bubble');
      var spRow  = el('div', 'jjt-speaker');
      var mic    = el('span', 'jjt-mic', '🎙');
      spRow.appendChild(mic);
      spRow.appendChild(document.createTextNode('\u00a0Coach Trenell asks:'));
      bubble.appendChild(spRow);

      var qp   = el('p', 'jjt-qtext');
      var tNode = document.createTextNode('');
      var cur   = el('span', 'jjt-cursor');
      qp.appendChild(tNode); qp.appendChild(cur);
      bubble.appendChild(qp);

      var tapH = el('div', 'jjt-tap-hint', 'Choose your answer ↓');
      bubble.appendChild(tapH);
      scene.appendChild(bubble);

      wrap.appendChild(scene);
      wrap.appendChild(aw);
      wrap.appendChild(expl);

      var util = el('div', 'jjt-util');
      var back = el('button', 'jjt-back', '← Change Category');
      back.type = 'button';
      back.addEventListener('click', function() { clearT(); renderSelect(container); });
      util.appendChild(back); wrap.appendChild(util);
      container.appendChild(wrap);

      /* Fire Coach Trenell typewriter. In Time Attack, the first timer starts after
         the first typed question appears, then keeps running for the full challenge. */
      setTimeout(function() {
        typewrite(tNode, cur, ci, dots, mic, aw, tapH, q.question, function() {
          S.questionStart = Date.now();
          if (isTimeAttack()) startTimeAttackTimer(container);
        });
      }, isTimeAttack() ? 120 : 280);

    } else {
      /* ── ADULT: Professor Andar video panel + dark question card ── */
      var PROF_VIDEO = CARDS.replace('/cards/', '/games/') + '../../../' +
        'Professor_Andar.mp4';
      /* Resolve proper path from CHILD_URI */
      var profVideoSrc = CHILD_URI + '/assets/jj-arcade/games/Professor_Andar.mp4';

      var stage = el('div', 'jjt-adult-stage');

      /* Left — Professor panel */
      var profPanel = el('div', 'jjt-prof-panel');
      profPanel.id = 'jjt-prof-panel';

      var profVid = document.createElement('video');
      profVid.id = 'jjt-prof-vid';
      profVid.src = profVideoSrc;
      profVid.muted = true;
      profVid.playsInline = true;
      profVid.preload = 'auto';
      profVid.className = 'jjt-prof-video';
      /* Seek to frame 0 and pause — shows idle hands-down state */
      profVid.addEventListener('loadedmetadata', function() {
        profVid.currentTime = 0;
      });
      /* After wave finishes — return to idle frame 0 */
      profVid.addEventListener('ended', function() {
        profVid.currentTime = 0;
        profVid.pause();
        profPanel.classList.remove('celebrate');
      });

      var profLabel = el('div', 'jjt-prof-label');
      profLabel.innerHTML =
        '<span class="jjt-prof-name">Prof. Andar Lin</span>' +
        '<span class="jjt-prof-rank">Black Belt · GB Lake Country</span>';

      profPanel.appendChild(profVid);
      profPanel.appendChild(profLabel);

      /* Right — question card */
      var card = el('div', 'jjt-adult-card');
      card.innerHTML =
        '<div class="jjt-adult-kicker">'+esc(catDef.short)+' Challenge</div>' +
        '<p class="jjt-adult-q">'+esc(q.question)+'</p>';

      stage.appendChild(profPanel);
      stage.appendChild(card);
      wrap.appendChild(stage);
      wrap.appendChild(aw);
      wrap.appendChild(expl);

      var util2 = el('div', 'jjt-util');
      var back2 = el('button', 'jjt-back', '← Change Category');
      back2.type = 'button';
      back2.addEventListener('click', function() { clearT(); renderSelect(container); });
      util2.appendChild(back2); wrap.appendChild(util2);
      container.appendChild(wrap);

      setTimeout(function() {
        aw.classList.add('jjt-answers--visible');
        if (isTimeAttack()) { S.questionStart = Date.now(); startTimeAttackTimer(container); }
      }, 80);
    }
  }

  /* ── HANDLE ANSWER ───────────────────────────────────────────────────────── */

  function handleAnswer(q, selectedIdx, selectedBtn, aw, expl, wrap, container) {
    if (S.answered) return;
    if (S.advT) { clearTimeout(S.advT); S.advT = null; }
    if (S.typeT) { clearTimeout(S.typeT); S.typeT = null; }
    S.answered = true;

    var correct = selectedIdx === q.correct;
    var earned = 0;
    S.totalAnswered++;
    if (correct) {
      S.correctCount++;
      S.streak++;
      if (S.streak > S.bestStreak) S.bestStreak = S.streak;
      if (isTimeAttack()) {
        earned += CFG.timeAttackCorrect;
        if (Date.now() - S.questionStart <= 5000) earned += CFG.timeAttackFastBonus;
        if (S.streak > 0 && S.streak % 5 === 0) earned += CFG.timeAttackStreak5;
        else if (S.streak > 0 && S.streak % 3 === 0) earned += CFG.timeAttackStreak3;
      } else {
        earned += CFG.pointsPerCorrect;
      }
      S.score += earned;
    } else {
      S.streak = 0;
    }

    /* Stop speaking */
    var ci   = wrap.querySelector('.jjt-coach');
    var dots = wrap.querySelector('.jjt-dots');
    var mic  = wrap.querySelector('.jjt-mic');
    var cur  = wrap.querySelector('.jjt-cursor');
    if (ci)   ci.classList.remove('jjt-speaking');
    if (dots) dots.classList.remove('jjt-dots--show');
    if (mic)  mic.classList.remove('jjt-mic--show');
    if (cur)  cur.classList.add('jjt-cursor--hidden');

    /* Snap full question (in case typewriter was mid-way) */
    var qp = wrap.querySelector('.jjt-qtext');
    if (qp) qp.innerHTML = esc(q.question);

    /* Ensure answers visible */
    aw.classList.add('jjt-answers--visible');

    /* Style buttons */
    aw.querySelectorAll('.jjt-ans').forEach(function(b) {
      var idx = parseInt(b.dataset.idx, 10);
      b.disabled = true;
      if (idx === q.correct)                  b.classList.add('correct');
      else if (b === selectedBtn && !correct) b.classList.add('wrong');
      else                                    b.classList.add('dimmed');
    });

    /* Score */
    var se = document.getElementById('jjt-score-el');
    if (se) se.textContent = S.score + ' pts';
    var ste = document.getElementById('jjt-streak-el');
    if (ste) ste.textContent = S.streak;
    var ae = document.getElementById('jjt-answered-el');
    if (ae) ae.textContent = S.totalAnswered;

    /* Flash + Professor Andar wave on correct */
    if (correct) {
      var flash = el('div', 'jjt-flash', '+' + earned);
      document.body.appendChild(flash);
      setTimeout(function() { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 820);

      /* Trigger Professor wave — adult mode only */
      if (S.mode === 'adult') {
        var profVidEl = document.getElementById('jjt-prof-vid');
        var profPanelEl = document.getElementById('jjt-prof-panel');
        if (profVidEl) {
          profVidEl.currentTime = 0;
          profPanelEl && profPanelEl.classList.add('celebrate');
          profVidEl.play().catch(function() {});
        }
      }
    }

    if (S.mode === 'kids') {
      showFeedback(wrap, correct ? coachLine('correct') : coachLine('wrong'));
      setCoachImage(wrap, correct ? IMG.coachNice : IMG.coachGoodTry);
    }

    /* Explanation */
    if (q.explanation) {
      var prefix = S.mode === 'kids'
        ? (correct ? '✅ Great job! Coach Trenell says: ' : '💡 Good try! Coach Trenell says: ')
        : (correct ? '✅ ' : '❌ ');
      expl.textContent = prefix + q.explanation;
      expl.className = 'jjt-expl show ' + (correct ? 'correct' : 'wrong');
    }

    /* Advance */
    var delay = isTimeAttack() ? 720 : (S.mode === 'kids' ? CFG.kidsAutoAdvanceMs : CFG.autoAdvanceMs);
    S.advT = setTimeout(function() {
      if (isTimeAttack() && S.timeLeft <= 0) { renderResults(container); return; }
      S.idx++;
      renderQuestion(container);
    }, delay);
  }

  /* ── RENDER: RESULTS ─────────────────────────────────────────────────────── */

  function renderResults(container) {
    if (S.advT) { clearTimeout(S.advT); S.advT = null; }
    if (S.typeT) { clearTimeout(S.typeT); S.typeT = null; }
    S.phase = 'results';
    container.innerHTML = '';

    if (S.timerT) { clearInterval(S.timerT); S.timerT = null; }
    var n10  = Math.round(S.score / CFG.pointsPerCorrect);
    var metric = isTimeAttack() ? S.score : n10;
    var rank = getBelt(metric);
    var prev = isTimeAttack() ? getTABest() : getHS();
    var newB = metric > prev;
    if (newB) { if (isTimeAttack()) setTABest(metric); else setHS(metric); }

    var catLbl = S.cat === 'all' ? 'All Questions' : getCat(S.cat).label;

    var copy = (function() {
      if (isTimeAttack()) {
        if (S.score < 400) return 'Good start. Try again and aim for faster answers and a stronger streak.';
        if (S.score < 800) return 'Nice run. You are building speed and Jiu-Jitsu knowledge at the same time.';
        if (S.score < 1300) return 'Strong challenge score. Coach Trenell can tell you are focused.';
        if (S.score < 1800) return 'Excellent run. That is sharp problem-solving under pressure.';
        return 'Huge score. That is Black Belt Brain energy.';
      }
      if (S.mode === 'kids') {
        if (n10 <= 3) return 'Great starting point. A trial week is perfect for learning these basics on the mat.';
        if (n10 <= 6) return 'Nice work! You already know some Jiu-Jitsu ideas — class will build even more confidence.';
        if (n10 <= 8) return 'Strong score. You may be ready to jump into class and train with real partners.';
        return 'Excellent. You look ready for the mats. Coach Trenell would be so impressed!';
      }
      if (n10 <= 3) return 'Good start. Fundamentals become clearer once you spend more time on the mat.';
      if (n10 <= 6) return 'Solid knowledge base. You understand several important BJJ and GB concepts.';
      if (n10 <= 8) return 'Strong result. You have a good grasp of Jiu-Jitsu culture, positions, and technique.';
      return 'Excellent score. That is black-belt-level trivia knowledge.';
    })();

    var wrap = el('div', 'jjt jjt-results');
    var card = el('div', 'jjt-res-card');
    card.innerHTML =
      '<div class="jjt-res-kicker">'+esc(catLbl)+'</div>' +
      '<div class="jjt-belt-strip" style="background:'+rank.color+';color:'+rank.tc+'"><div class="jjt-belt-name">'+esc(rank.belt.toUpperCase())+' BELT</div></div>' +
      '<div class="jjt-rank-lbl">'+esc(rank.label)+'</div>' +
      '<p class="jjt-rank-msg">'+esc(rank.msg)+'</p>' +
      '<div class="jjt-score-wrap">' +
        (isTimeAttack()
          ? '<div class="jjt-final">'+S.score+'<span> pts</span></div><div class="jjt-final-lbl">Time Attack Score</div>'
          : '<div class="jjt-final">'+n10+'<span>/'+S.session.length+'</span></div><div class="jjt-final-lbl">Questions Correct</div>') +
        (isTimeAttack()
          ? '<div class="jjt-ta-summary"><div class="jjt-ta-stat"><strong>'+S.correctCount+'</strong><span>Correct</span></div><div class="jjt-ta-stat"><strong>'+S.totalAnswered+'</strong><span>Answered</span></div><div class="jjt-ta-stat"><strong>'+S.bestStreak+'</strong><span>Best Streak</span></div></div>'
          : '') +
        (newB?'<div class="jjt-new-best">🏆 New Personal Best!</div>':'<div class="jjt-prev-best">Best: '+prev+(isTimeAttack()?' pts':'/'+S.session.length)+'</div>') +
      '</div>' +
      '<p class="jjt-res-copy">'+esc(copy)+'</p>' +
      '<div class="jjt-res-btns">' +
        '<button type="button" class="jjt-r-btn primary" id="jjt-play-again">🔄 Play Again</button>' +
        '<button type="button" class="jjt-r-btn secondary" id="jjt-change-cat">📚 Change Category</button>' +
        '<a class="jjt-r-btn trial" href="/kids-program/#gb_signup_form">🥋 Claim Your 1-Week Free Trial</a>' +
      '</div>';
    wrap.appendChild(card);
    container.appendChild(wrap);

    document.getElementById('jjt-play-again').addEventListener('click', function() { startGame(container); });
    document.getElementById('jjt-change-cat').addEventListener('click', function() { renderSelect(container); });
  }

  /* ── LOAD QUESTIONS ──────────────────────────────────────────────────────── */

  function loadQuestions(cb) {
    var url = DATA + 'trivia-' + S.mode + '.json';
    fetch(url)
      .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(data) { S.allQ = data.questions || []; if (cb) cb(); })
      .catch(function(err) { console.error('[JJA-022] Trivia JSON error:', err); S.allQ = []; if (cb) cb(); });
  }

  /* ── MODULE REGISTRATION ─────────────────────────────────────────────────── */

  function registerModule() {
    if (!window.JJGames) window.JJGames = {};

    window.JJGames['trivia'] = {
      mount: function(container) {
        injectStyles(); clearT();
        S.mode = CFG.defaultMode; S.cat = 'all';
        S.session = []; S.idx = 0; S.score = 0; S.answered = false; S.challenge = 'classic'; S.timeLeft = 0; S.totalAnswered = 0; S.correctCount = 0; S.streak = 0; S.bestStreak = 0;
        loadQuestions(function() { renderSelect(container); });
      },
      unmount: function(container) { clearT(); container.innerHTML = ''; }
    };

    if (typeof window.JJGamesReady === 'function') window.JJGamesReady('trivia');
    document.dispatchEvent(new CustomEvent('jjgame:ready', { detail: { game: 'trivia' } }));
  }

  /* ── BOOT ────────────────────────────────────────────────────────────────── */

  if (typeof window.waitForModule === 'function') {
    window.waitForModule('trivia', registerModule);
  } else {
    registerModule();
  }

})();
