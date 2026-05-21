/* ==========================================================================
   belt-explainer.js — Coach Trenell Belt System Explainer
   JJA-CT-006 · Gracie Barra Lake Country
   Version: 1.0.0

   Standalone page at /bjj-belt-guide
   Also embeddable via Elementor HTML widget.

   Assets required (all already live on IONOS):
     /assets/jj-arcade/cards/gb-trenell.webp
     /assets/jj-arcade/cards/gb-trenell-nice.webp
     /assets/jj-arcade/cards/gb_academy.webp

   Data file required:
     /assets/jj-arcade/data/belt-explainer-data.json

   HOW TO EMBED on /bjj-belt-guide WordPress page:
     1. Create a new WordPress page, slug: bjj-belt-guide
     2. Use Elementor → Add Widget → HTML
     3. Paste:
          <div id="jja-belt-explainer-root"></div>
          <script src="YOUR_CHILD_URI/assets/jj-arcade/games/belt-explainer.js"></script>
          <script>
            window.CHILD_URI = 'YOUR_CHILD_URI';
            if(window.JJBeltExplainer) window.JJBeltExplainer.init('jja-belt-explainer-root');
          </script>
     4. Replace YOUR_CHILD_URI with the actual child theme URI
   ========================================================================== */

(function () {
  'use strict';

  /* ── PATHS ───────────────────────────────────────────────────────────────── */

  var CHILD_URI = (function () {
    if (window.CHILD_URI && window.CHILD_URI.length > 1) return window.CHILD_URI;
    var cfg = window.JJ_ARCADE_CONFIG;
    if (cfg && cfg.cardFront) {
      return cfg.cardFront.replace('/assets/jj-arcade/cards/jj-card-junior-1.png', '');
    }
    return '/wp-content/themes/hello-theme-child-master';
  })();

  var CARDS    = CHILD_URI + '/assets/jj-arcade/cards/';
  var DATA_URL = CHILD_URI + '/assets/jj-arcade/data/belt-explainer-data.json';
  var CTA_URL  = '/kids-program/#gb_signup_form';

  var SPRITES = {
    neutral : CARDS + 'gb-trenell.webp',
    nice    : CARDS + 'gb-trenell-nice.webp'
  };

  /* ── STATE ───────────────────────────────────────────────────────────────── */

  var S = {
    mode       : 'kids',
    activeIdx  : 0,
    data       : null,
    typeTimer  : null,
    mountEl    : null
  };

  /* ── STYLES ──────────────────────────────────────────────────────────────── */

  function injectStyles() {
    if (document.getElementById('jja-be-styles')) return;
    var s = document.createElement('style');
    s.id = 'jja-be-styles';
    s.textContent = [
      /* fonts */
      '@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;600;700;800&display=swap");',

      /* wrap */
      '.jja-be{width:100%;max-width:900px;margin:0 auto;padding:24px 16px 48px;font-family:"Barlow","Segoe UI",system-ui,sans-serif;color:#111827;box-sizing:border-box;}',
      '.jja-be *{box-sizing:border-box;}',

      /* page header */
      '.jja-be-hdr{background:#0e1520;border-radius:18px;padding:28px 32px;margin-bottom:20px;display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;}',
      '.jja-be-hdr-text{}',
      '.jja-be-eyebrow{display:inline-flex;background:#C8102E;color:#fff;font-size:9px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;padding:4px 12px;border-radius:999px;margin-bottom:10px;}',
      '.jja-be-htitle{font-family:"Barlow Condensed",sans-serif;font-size:clamp(32px,5vw,52px);font-weight:900;color:#fff;text-transform:uppercase;line-height:0.95;letter-spacing:-0.02em;margin:0 0 8px;}',
      '.jja-be-htitle span{color:#C8102E;}',
      '.jja-be-hsub{font-size:14px;color:rgba(255,255,255,0.6);font-weight:600;line-height:1.5;max-width:400px;}',

      /* mode toggle */
      '.jja-be-mode{display:flex;gap:8px;}',
      '.jja-be-mode-btn{font-family:"Barlow",sans-serif;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:9px 20px;border-radius:999px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.18s;}',
      '.jja-be-mode-btn:hover{border-color:rgba(255,255,255,0.5);color:#fff;}',
      '.jja-be-mode-btn.active{background:#C8102E;border-color:#C8102E;color:#fff;}',

      /* belt pill strip */
      '.jja-be-belts{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}',
      '.jja-be-pill{display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:999px;border:2px solid transparent;cursor:pointer;transition:all 0.2s;font-family:"Barlow",sans-serif;font-size:12px;font-weight:800;letter-spacing:0.04em;box-shadow:0 2px 8px rgba(0,0,0,0.08);}',
      '.jja-be-pill:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,0.14);}',
      '.jja-be-pill.active{border-color:rgba(0,0,0,0.3)!important;transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,0.18);}',
      '.jja-be-pill-swatch{width:12px;height:12px;border-radius:50%;border:1.5px solid rgba(0,0,0,0.15);flex-shrink:0;}',

      /* scene */
      '.jja-be-scene{position:relative;border-radius:20px;overflow:hidden;background:#0e1520;min-height:300px;display:flex;align-items:flex-end;margin-bottom:16px;box-shadow:0 12px 40px rgba(0,0,0,0.18);}',
      '.jja-be-scene-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0.42;}',
      '.jja-be-scene-ov{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.35) 55%,transparent 100%);}',

      /* belt accent bar across bottom of scene */
      '.jja-be-accent{position:absolute;bottom:0;left:0;right:0;height:4px;transition:background 0.3s ease;}',

      /* coach — !important overrides Elementor global img rule (height:auto, max-width:100%) */
      '.jja-be-coach{position:absolute!important;bottom:0!important;right:24px!important;height:210px!important;width:auto!important;max-width:210px!important;object-fit:contain!important;filter:drop-shadow(0 6px 20px rgba(0,0,0,0.5));transform-origin:bottom center;transition:opacity 0.2s ease;}',
      '.jja-be-coach.talking{animation:jjabe-bob 0.5s ease-in-out infinite alternate;}',
      '.jja-be-coach.swap-out{opacity:0;}',
      '.jja-be-coach.swap-in{opacity:1;}',
      '@keyframes jjabe-bob{from{transform:translateY(0) rotate(-0.3deg);}to{transform:translateY(-5px) rotate(0.3deg);}}',

      /* scene content */
      '.jja-be-scene-content{position:relative;z-index:2;padding:22px 26px 22px 24px;max-width:62%;display:flex;flex-direction:column;gap:8px;}',
      '.jja-be-sc-eyebrow{display:inline-flex;align-items:center;gap:5px;background:#C8102E;color:#fff;font-size:9px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;padding:3px 10px;border-radius:999px;width:fit-content;}',
      '.jja-be-belt-label{font-family:"Barlow Condensed",sans-serif;font-size:clamp(22px,4vw,34px);font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:-0.01em;line-height:1;}',
      '.jja-be-bubble{background:rgba(255,255,255,0.1);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.18);border-radius:12px;padding:12px 15px;min-height:56px;display:flex;flex-direction:column;gap:4px;}',
      '.jja-be-bubble-speaker{font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:2px;}',
      '.jja-be-bubble-text{font-size:13px;font-weight:600;color:#fff;line-height:1.48;min-height:20px;}',

      /* cursor */
      '.jja-be-cursor{display:inline-block;width:2px;height:0.92em;background:#C8102E;margin-left:1px;vertical-align:text-bottom;animation:jjabe-blink 0.85s step-end infinite;}',
      '.jja-be-cursor.hidden{opacity:0;}',
      '@keyframes jjabe-blink{0%,100%{opacity:1;}50%{opacity:0;}}',

      /* dots */
      '.jja-be-dots{display:flex;gap:3px;opacity:0;transition:opacity 0.2s;margin-top:3px;}',
      '.jja-be-dots.show{opacity:1;}',
      '.jja-be-dots span{width:5px;height:5px;border-radius:50%;background:#C8102E;animation:jjabe-dp 1s ease-in-out infinite;}',
      '.jja-be-dots span:nth-child(2){animation-delay:0.16s;}',
      '.jja-be-dots span:nth-child(3){animation-delay:0.32s;}',
      '@keyframes jjabe-dp{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1);}}',

      /* info cards */
      '.jja-be-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;}',
      '.jja-be-card{background:#fff;border:0.5px solid #e5e7eb;border-radius:14px;padding:16px 18px;box-shadow:0 4px 12px rgba(0,0,0,0.05);}',
      '.jja-be-card-icon{font-size:20px;margin-bottom:6px;}',
      '.jja-be-card-lbl{font-size:9px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;margin-bottom:5px;}',
      '.jja-be-card-val{font-size:14px;font-weight:800;color:#111827;line-height:1.35;margin-bottom:4px;}',
      '.jja-be-card-sub{font-size:11px;color:#6b7280;line-height:1.5;}',

      /* parent note */
      '.jja-be-parent-note{background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:13px 16px;margin-bottom:20px;font-size:13px;font-weight:600;color:#92400e;line-height:1.55;display:none;}',
      '.jja-be-parent-note.show{display:block;}',
      '.jja-be-parent-note strong{display:block;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px;color:#b45309;}',

      /* CTA */
      '.jja-be-cta{background:#0e1520;border-radius:16px;padding:24px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}',
      '.jja-be-cta-text h3{font-family:"Barlow Condensed",sans-serif;font-size:26px;font-weight:900;color:#fff;text-transform:uppercase;line-height:1.1;margin:0 0 4px;}',
      '.jja-be-cta-text h3 span{color:#C8102E;}',
      '.jja-be-cta-text p{font-size:12px;color:rgba(255,255,255,0.45);margin:0;}',
      '.jja-be-cta-btn{display:inline-block;background:#C8102E;color:#fff;font-family:"Barlow",sans-serif;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:12px 24px;border-radius:999px;text-decoration:none;white-space:nowrap;transition:opacity 0.18s;box-shadow:0 8px 24px rgba(200,16,46,0.3);}',
      '.jja-be-cta-btn:hover{opacity:0.88;}',

      /* belt progress strip */
      '.jja-be-progress{display:flex;gap:4px;margin-bottom:18px;}',
      '.jja-be-prog-seg{flex:1;height:5px;border-radius:999px;opacity:0.35;transition:opacity 0.2s;}',
      '.jja-be-prog-seg.active{opacity:1;}',

      /* mobile */
      '@media(max-width:600px){',
        '.jja-be{padding:16px 10px 36px;}',
        '.jja-be-hdr{padding:20px 18px;border-radius:14px;}',
        '.jja-be-coach{height:160px!important;max-width:160px!important;right:8px!important;}',
        '.jja-be-scene{min-height:260px;}',
        '.jja-be-scene-content{max-width:68%;padding:14px 10px;}',
        '.jja-be-bubble-text{font-size:12px;}',
        '.jja-be-belt-label{font-size:20px;}',
        '.jja-be-cards{grid-template-columns:1fr 1fr;}',
        '.jja-be-card:last-child{grid-column:1/-1;}',
        '.jja-be-mode{flex-wrap:wrap;}',
        '.jja-be-htitle{font-size:28px;}',
      '}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── TYPEWRITER ──────────────────────────────────────────────────────────── */

  function typewrite(text, onDone) {
    if (S.typeTimer) clearTimeout(S.typeTimer);
    var textEl  = document.getElementById('jja-be-quote-text');
    var cursor  = document.getElementById('jja-be-cursor');
    var dots    = document.getElementById('jja-be-dots');
    var coach   = document.getElementById('jja-be-coach');
    if (!textEl) return;

    var textNode = textEl.childNodes[0];
    if (!textNode) { textNode = document.createTextNode(''); textEl.insertBefore(textNode, textEl.firstChild); }

    textNode.nodeValue = '';
    if (cursor)  cursor.classList.remove('hidden');
    if (dots)    dots.classList.add('show');
    if (coach)   coach.classList.add('talking');

    var chars = text.split('');
    var i = 0;

    function delay(ch) {
      if (ch === ' ')                              return 22;
      if (ch === ',' || ch === ';')               return 95;
      if (ch === '.' || ch === '?' || ch === '!') return 130;
      return 28 + Math.random() * 16;
    }

    function tick() {
      if (i >= chars.length) {
        if (cursor) cursor.classList.add('hidden');
        if (dots)   dots.classList.remove('show');
        if (coach)  coach.classList.remove('talking');
        if (onDone) onDone();
        return;
      }
      textNode.nodeValue += chars[i];
      i++;
      S.typeTimer = setTimeout(tick, delay(chars[i - 1]));
    }
    tick();
  }

  /* ── SPRITE SWAP ─────────────────────────────────────────────────────────── */

  function setSprite(key) {
    var coach = document.getElementById('jja-be-coach');
    if (!coach) return;
    var src = SPRITES[key] || SPRITES.neutral;
    if (coach.getAttribute('data-sprite') === key) return;
    coach.setAttribute('data-sprite', key);
    coach.classList.add('swap-out');
    setTimeout(function () {
      coach.src = src;
      coach.classList.remove('swap-out');
      coach.classList.add('swap-in');
    }, 180);
  }

  /* ── RENDER ──────────────────────────────────────────────────────────────── */

  function render() {
    if (!S.mountEl || !S.data) return;
    var container = S.mountEl;
    container.innerHTML = '';

    var belts = S.data[S.mode];

    var wrap = document.createElement('div');
    wrap.className = 'jja-be';

    /* ── PAGE HEADER ── */
    var hdr = document.createElement('div');
    hdr.className = 'jja-be-hdr';
    hdr.innerHTML =
      '<div class="jja-be-hdr-text">' +
        '<div class="jja-be-eyebrow">🥋 Gracie Barra Lake Country</div>' +
        '<h1 class="jja-be-htitle">The <span>Belt</span> System</h1>' +
        '<p class="jja-be-hsub">Click any belt — Coach Trenell will walk you through what it means, what students are learning, and how long it takes.</p>' +
      '</div>' +
      '<div class="jja-be-mode" id="jja-be-mode-toggle"></div>';
    wrap.appendChild(hdr);

    /* ── BELT PILLS ── */
    var pillStrip = document.createElement('div');
    pillStrip.className = 'jja-be-belts';
    pillStrip.id = 'jja-be-pills';
    wrap.appendChild(pillStrip);

    /* ── PROGRESS BAR ── */
    var prog = document.createElement('div');
    prog.className = 'jja-be-progress';
    prog.id = 'jja-be-progress';
    wrap.appendChild(prog);

    /* ── SCENE ── */
    var scene = document.createElement('div');
    scene.className = 'jja-be-scene';

    var sceneBg = document.createElement('div');
    sceneBg.className = 'jja-be-scene-bg';
    sceneBg.style.backgroundImage = 'url("' + CARDS + 'gb_academy.webp")';
    scene.appendChild(sceneBg);

    var sceneOv = document.createElement('div');
    sceneOv.className = 'jja-be-scene-ov';
    scene.appendChild(sceneOv);

    var accent = document.createElement('div');
    accent.className = 'jja-be-accent';
    accent.id = 'jja-be-accent';
    scene.appendChild(accent);

    var coach = document.createElement('img');
    coach.className = 'jja-be-coach swap-in';
    coach.id = 'jja-be-coach';
    coach.src = SPRITES.neutral;
    coach.alt = 'Coach Trenell';
    coach.setAttribute('data-sprite', 'neutral');
    coach.onerror = function () { this.style.display = 'none'; };
    scene.appendChild(coach);

    var scContent = document.createElement('div');
    scContent.className = 'jja-be-scene-content';

    var scEyebrow = document.createElement('span');
    scEyebrow.className = 'jja-be-sc-eyebrow';
    scEyebrow.textContent = '🥋 Coach Trenell';
    scContent.appendChild(scEyebrow);

    var beltLabel = document.createElement('div');
    beltLabel.className = 'jja-be-belt-label';
    beltLabel.id = 'jja-be-belt-label';
    scContent.appendChild(beltLabel);

    var bubble = document.createElement('div');
    bubble.className = 'jja-be-bubble';

    var bubbleSpeaker = document.createElement('div');
    bubbleSpeaker.className = 'jja-be-bubble-speaker';
    bubbleSpeaker.textContent = 'Coach Trenell says:';
    bubble.appendChild(bubbleSpeaker);

    var bubbleText = document.createElement('div');
    bubbleText.className = 'jja-be-bubble-text';
    bubbleText.id = 'jja-be-quote-text';
    bubbleText.appendChild(document.createTextNode(''));

    var cursor = document.createElement('span');
    cursor.className = 'jja-be-cursor hidden';
    cursor.id = 'jja-be-cursor';
    bubbleText.appendChild(cursor);
    bubble.appendChild(bubbleText);

    var dots = document.createElement('div');
    dots.className = 'jja-be-dots';
    dots.id = 'jja-be-dots';
    for (var d = 0; d < 3; d++) dots.appendChild(document.createElement('span'));
    bubble.appendChild(dots);

    scContent.appendChild(bubble);
    scene.appendChild(scContent);
    wrap.appendChild(scene);

    /* ── INFO CARDS ── */
    var cards = document.createElement('div');
    cards.className = 'jja-be-cards';
    cards.id = 'jja-be-cards';
    wrap.appendChild(cards);

    /* ── PARENT NOTE ── */
    var parentNote = document.createElement('div');
    parentNote.className = 'jja-be-parent-note';
    parentNote.id = 'jja-be-parent-note';
    wrap.appendChild(parentNote);

    /* ── CTA ── */
    var cta = document.createElement('div');
    cta.className = 'jja-be-cta';
    cta.innerHTML =
      '<div class="jja-be-cta-text">' +
        '<h3>Ready to start with <span>Coach Trenell?</span></h3>' +
        '<p>Gracie Barra Lake Country · Lake Country, BC · gblakecountry.com</p>' +
      '</div>' +
      '<a class="jja-be-cta-btn" href="' + CTA_URL + '">Book a Free Trial Class →</a>';
    wrap.appendChild(cta);

    container.appendChild(wrap);

    /* Build mode toggle */
    buildModeToggle();

    /* Build pills + progress for current mode */
    buildPills(belts);
    buildProgress(belts);

    /* Show first belt */
    showBelt(0, belts, true);
  }

  /* ── BUILD MODE TOGGLE ───────────────────────────────────────────────────── */

  function buildModeToggle() {
    var toggle = document.getElementById('jja-be-mode-toggle');
    if (!toggle) return;
    toggle.innerHTML = '';
    ['kids', 'adult'].forEach(function (m) {
      var btn = document.createElement('button');
      btn.className = 'jja-be-mode-btn' + (S.mode === m ? ' active' : '');
      btn.textContent = m === 'kids' ? 'Kids' : 'Adults';
      btn.addEventListener('click', function () {
        if (S.mode === m) return;
        S.mode = m;
        S.activeIdx = 0;
        var belts = S.data[S.mode];
        buildModeToggle();
        buildPills(belts);
        buildProgress(belts);
        showBelt(0, belts, true);
      });
      toggle.appendChild(btn);
    });
  }

  /* ── BUILD PILLS ─────────────────────────────────────────────────────────── */

  function buildPills(belts) {
    var strip = document.getElementById('jja-be-pills');
    if (!strip) return;
    strip.innerHTML = '';
    belts.forEach(function (b, i) {
      var pill = document.createElement('button');
      pill.className = 'jja-be-pill' + (i === S.activeIdx ? ' active' : '');
      pill.style.background = b.color;
      pill.style.color = b.textColor;
      var swatch = document.createElement('span');
      swatch.className = 'jja-be-pill-swatch';
      swatch.style.background = b.stripe || b.color;
      pill.appendChild(swatch);
      pill.appendChild(document.createTextNode(b.label));
      pill.addEventListener('click', (function (idx) {
        return function () {
          if (S.activeIdx === idx) return;
          S.activeIdx = idx;
          buildPills(belts);
          buildProgress(belts);
          showBelt(idx, belts, false);
        };
      })(i));
      strip.appendChild(pill);
    });
  }

  /* ── BUILD PROGRESS ──────────────────────────────────────────────────────── */

  function buildProgress(belts) {
    var prog = document.getElementById('jja-be-progress');
    if (!prog) return;
    prog.innerHTML = '';
    belts.forEach(function (b, i) {
      var seg = document.createElement('div');
      seg.className = 'jja-be-prog-seg' + (i <= S.activeIdx ? ' active' : '');
      seg.style.background = b.color;
      prog.appendChild(seg);
    });
  }

  /* ── SHOW BELT ───────────────────────────────────────────────────────────── */

  function showBelt(idx, belts, isFirst) {
    var b = belts[idx];
    if (!b) return;

    /* Update belt label */
    var lbl = document.getElementById('jja-be-belt-label');
    if (lbl) lbl.textContent = b.label;

    /* Accent bar color */
    var accent = document.getElementById('jja-be-accent');
    if (accent) accent.style.background = b.color;

    /* Sprite — neutral for intro, nice after first visit */
    setSprite(isFirst ? 'neutral' : 'nice');
    if (!isFirst) {
      setTimeout(function () { setSprite('neutral'); }, 1400);
    }

    /* Typewriter */
    typewrite(b.quote);

    /* Info cards */
    var cards = document.getElementById('jja-be-cards');
    if (cards) {
      cards.innerHTML = [
        { icon: '⏱', label: 'Time at this belt', val: b.time, sub: b.timeDetail },
        { icon: '🥋', label: 'Core focus areas',  val: b.focus, sub: '' },
        { icon: '🏅', label: 'Key milestone',      val: b.milestone, sub: '' }
      ].map(function (c) {
        return '<div class="jja-be-card">' +
          '<div class="jja-be-card-icon">' + c.icon + '</div>' +
          '<div class="jja-be-card-lbl">' + c.label + '</div>' +
          '<div class="jja-be-card-val">' + esc(c.val) + '</div>' +
          (c.sub ? '<div class="jja-be-card-sub">' + esc(c.sub) + '</div>' : '') +
          '</div>';
      }).join('');
    }

    /* Parent note — kids mode only */
    var note = document.getElementById('jja-be-parent-note');
    if (note) {
      if (S.mode === 'kids' && b.parentNote) {
        note.innerHTML = '<strong>👨‍👩‍👧 For Parents</strong>' + esc(b.parentNote);
        note.classList.add('show');
      } else {
        note.classList.remove('show');
      }
    }
  }

  /* ── LOAD DATA ───────────────────────────────────────────────────────────── */

  function loadData(cb) {
    fetch(DATA_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        S.data = data;
        if (cb) cb();
      })
      .catch(function (err) {
        console.error('[JJA-CT-006] Belt explainer data error:', err);
        if (cb) cb();
      });
  }

  /* ── UTILITY ─────────────────────────────────────────────────────────────── */

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── PUBLIC API ──────────────────────────────────────────────────────────── */

  function doInit(containerId) {
    var el = document.getElementById(containerId);
    if (!el) {
      /* Elementor may still be rendering — retry once after 400ms */
      setTimeout(function () {
        var el2 = document.getElementById(containerId);
        if (!el2) { console.warn('[JJA-CT-006] Container not found after retry:', containerId); return; }
        S.mountEl = el2;
        S.mode = 'kids';
        S.activeIdx = 0;
        injectStyles();
        loadData(function () {
          if (!S.data) {
            el2.innerHTML = '<p style="padding:24px;color:#C8102E;">Belt explainer data could not be loaded.</p>';
            return;
          }
          render();
        });
      }, 400);
      return;
    }
    S.mountEl = el;
    S.mode = 'kids';
    S.activeIdx = 0;
    injectStyles();
    loadData(function () {
      if (!S.data) {
        el.innerHTML = '<p style="padding:24px;color:#C8102E;">Belt explainer data could not be loaded. Check that belt-explainer-data.json is deployed.</p>';
        return;
      }
      render();
    });
  }

  window.JJBeltExplainer = {
    init: function (containerId) { doInit(containerId); }
  };

  /* Also register as JJGames module for arcade router compatibility */
  window.JJGames = window.JJGames || {};
  window.JJGames['belt-explainer'] = {
    mount: function (container) {
      var id = 'jja-be-auto-' + Date.now();
      container.id = id;
      window.JJBeltExplainer.init(id);
    }
  };

})();