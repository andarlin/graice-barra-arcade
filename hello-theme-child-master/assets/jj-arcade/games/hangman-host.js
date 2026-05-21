/* ==========================================================================
   hangman-host.js — Coach Trenell Hangman Host
   JJA-CT-001 · Gracie Barra Lake Country · Jiu-Jitsu Arcade
   Version: 1.1.0 — Multi-sprite: nice / good-try / neutral

   Assets required in /assets/jj-arcade/cards/:
     gb-trenell.webp          ← neutral / intro / thinking
     gb-trenell-nice.webp     ← correct guess / win
     gb-trenell-good-try.webp ← wrong guess / lose
   ========================================================================== */

(function () {
  'use strict';

  /* ── ASSET PATHS ─────────────────────────────────────────────────────────── */

  var CHILD_URI = (function () {
    if (window.CHILD_URI && window.CHILD_URI.length > 1) return window.CHILD_URI;
    var cfg = window.JJ_ARCADE_CONFIG;
    if (cfg && cfg.cardFront) {
      return cfg.cardFront.replace('/assets/jj-arcade/cards/jj-card-junior-1.png', '');
    }
    return '/wp-content/themes/hello-theme-child-master';
  })();

  var CARDS = CHILD_URI + '/assets/jj-arcade/cards/';

  var SPRITES = {
    neutral : CARDS + 'gb-trenell.webp',
    nice    : CARDS + 'gb-trenell-nice.webp',
    goodTry : CARDS + 'gb-trenell-good-try.webp'
  };

  /* ── DIALOGUE ────────────────────────────────────────────────────────────── */

  var DIALOGUE = {
    intro: {
      'techniques': [
        "Alright, this word is a BJJ technique! Think about what we drill on the mat...",
        "This one's a technique name. Time to show what you've been practising!",
        "Technique category! If you've been drilling, you'll know this one."
      ],
      'positions': [
        "This word is a BJJ position. Where do you want to be on the mat?",
        "Positions category! Think about top game, bottom game, and in-between.",
        "This is a position you've definitely been in before — on the mat!"
      ],
      'default': [
        "Okay, I've got a word for you. Let's see how well you know your Jiu-Jitsu!",
        "Think carefully — this one's from the world of Gracie Barra.",
        "Here we go! This word is hiding behind those blanks. Can you figure it out?",
        "Let's test your BJJ vocabulary. Ready? Here's your word...",
        "Coach Trenell has a challenge for you. Take your time and think it through!"
      ]
    },
    wrong: [
      "Hmm, not that one. Keep thinking — you've got this!",
      "Not quite! Remember what we covered in class?",
      "Nope! But don't panic — stay calm like on the mat.",
      "That's not it... breathe, think, and try again!",
      "Wrong letter! A good BJJ player doesn't panic under pressure.",
      "Nope! Even the best tap sometimes. Keep going!",
      "Not that one. You're still in this — think strategically!"
    ],
    danger: [
      "One more wrong and that's it! Focus — what do you know for sure?",
      "Last chance! Take a breath and think about what letters make sense.",
      "You're almost out of guesses. Don't rush — be deliberate!"
    ],
    correct: [
      "Yes! Great letter! Keep it up!",
      "Nice! That's the kind of sharp thinking I like to see.",
      "Good one! You're getting closer — stay focused.",
      "Oss! That's right. Keep going!"
    ],
    win: [
      "YESSS! That's it! Oss! You figured it out — I knew you would!",
      "Amazing work! You solved it. Professor would be proud!",
      "That's what I'm talking about! Sharp mind, sharp BJJ. Oss!",
      "Incredible! You didn't give up and you got it. That's the GB way!"
    ],
    lose: [
      "Oh no... that one got away from you. But every loss is a lesson — remember that!",
      "We'll get the next one. Every black belt has been in tough spots like this.",
      "Don't worry — even champions lose sometimes. What matters is you keep showing up.",
      "That's okay! Now you know. Next time you'll have that one in your back pocket."
    ]
  };

  /* ── STYLES ──────────────────────────────────────────────────────────────── */

  function injectStyles() {
    if (document.getElementById('jja-hangman-host-styles')) return;
    var s = document.createElement('style');
    s.id = 'jja-hangman-host-styles';
    s.textContent = [
      '.jjh-host{width:100%;margin-bottom:18px;border-radius:18px;overflow:hidden;position:relative;background:#0e1520;min-height:170px;display:flex;align-items:flex-end;font-family:\'Barlow\',\'Segoe UI\',system-ui,sans-serif;}',
      '.jjh-bg{position:absolute;inset:0;background-size:cover;background-position:center top;opacity:0.42;}',
      '.jjh-overlay{position:absolute;inset:0;background:linear-gradient(to right,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.3) 55%,transparent 100%);}',

      /* Coach — cross-fade on sprite swap */
      '.jjh-coach{position:absolute;bottom:0;right:24px;height:156px;width:auto;object-fit:contain;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.55));transform-origin:bottom center;transition:opacity 0.2s ease;}',
      '.jjh-coach.jjh-swap-out{opacity:0;}',
      '.jjh-coach.jjh-swap-in{opacity:1;}',
      '.jjh-coach.jjh-talking{animation:jjh-bob 0.55s ease-in-out infinite alternate;}',
      '@keyframes jjh-bob{from{transform:translateY(0) rotate(-0.3deg);}to{transform:translateY(-5px) rotate(0.3deg);}}',

      /* Content */
      '.jjh-content{position:relative;z-index:2;padding:18px 24px 18px 22px;max-width:66%;display:flex;flex-direction:column;gap:7px;}',
      '.jjh-eyebrow{display:inline-flex;align-items:center;gap:6px;background:#C8102E;color:#fff;font-size:9px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;padding:3px 10px;border-radius:999px;width:fit-content;}',
      '.jjh-bubble{background:rgba(255,255,255,0.1);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:10px 14px;min-height:48px;display:flex;flex-direction:column;gap:4px;}',
      '.jjh-speaker{font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:2px;}',
      '.jjh-text{font-size:13px;font-weight:600;color:#fff;line-height:1.45;min-height:20px;}',

      /* Cursor */
      '.jjh-cursor{display:inline-block;width:2px;height:0.95em;background:#C8102E;margin-left:1px;vertical-align:text-bottom;animation:jjh-blink 0.85s step-end infinite;}',
      '.jjh-cursor.jjh-hidden{opacity:0;}',
      '@keyframes jjh-blink{0%,100%{opacity:1;}50%{opacity:0;}}',

      /* Dots */
      '.jjh-dots{display:flex;gap:3px;opacity:0;transition:opacity 0.2s;margin-top:2px;}',
      '.jjh-dots.jjh-show{opacity:1;}',
      '.jjh-dots span{width:5px;height:5px;border-radius:50%;background:#C8102E;animation:jjh-dp 1s ease-in-out infinite;}',
      '.jjh-dots span:nth-child(2){animation-delay:0.16s;}',
      '.jjh-dots span:nth-child(3){animation-delay:0.32s;}',
      '@keyframes jjh-dp{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1);}}',

      '.jjh-cat{font-size:10px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:0.08em;text-transform:uppercase;}',

      '@media(max-width:540px){.jjh-host{min-height:140px;}.jjh-coach{height:120px;right:10px;}.jjh-content{max-width:72%;padding:14px 12px;}.jjh-text{font-size:12px;}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ── BUILD HOST ELEMENT ──────────────────────────────────────────────────── */

  function buildHostEl() {
    var host = document.createElement('div');
    host.className = 'jjh-host';
    host.id = 'jjaHangmanHost';

    var bg = document.createElement('div');
    bg.className = 'jjh-bg';
    bg.style.backgroundImage = 'url("' + CARDS + 'gb_academy.webp")';
    host.appendChild(bg);

    var ov = document.createElement('div');
    ov.className = 'jjh-overlay';
    host.appendChild(ov);

    var coach = document.createElement('img');
    coach.className = 'jjh-coach jjh-swap-in';
    coach.id = 'jjaHostCoach';
    coach.src = SPRITES.neutral;
    coach.alt = 'Coach Trenell';
    coach.onerror = function () { this.style.display = 'none'; };
    host.appendChild(coach);

    var content = document.createElement('div');
    content.className = 'jjh-content';

    var eyebrow = document.createElement('span');
    eyebrow.className = 'jjh-eyebrow';
    eyebrow.textContent = '🥋 Coach Trenell';
    content.appendChild(eyebrow);

    var bubble = document.createElement('div');
    bubble.className = 'jjh-bubble';

    var speaker = document.createElement('div');
    speaker.className = 'jjh-speaker';
    speaker.textContent = 'Coach Trenell says:';
    bubble.appendChild(speaker);

    var textEl = document.createElement('div');
    textEl.className = 'jjh-text';
    textEl.id = 'jjaHostText';
    textEl.appendChild(document.createTextNode(''));

    var cursor = document.createElement('span');
    cursor.className = 'jjh-cursor jjh-hidden';
    cursor.id = 'jjaHostCursor';
    textEl.appendChild(cursor);
    bubble.appendChild(textEl);

    var dots = document.createElement('div');
    dots.className = 'jjh-dots';
    dots.id = 'jjaHostDots';
    for (var i = 0; i < 3; i++) dots.appendChild(document.createElement('span'));
    bubble.appendChild(dots);
    content.appendChild(bubble);

    var catLbl = document.createElement('div');
    catLbl.className = 'jjh-cat';
    catLbl.id = 'jjaHostCat';
    content.appendChild(catLbl);

    host.appendChild(content);
    return host;
  }

  /* ── SPRITE SWAP (cross-fade) ────────────────────────────────────────────── */

  function setSprite(key) {
    var coach = document.getElementById('jjaHostCoach');
    if (!coach) return;
    var src = SPRITES[key] || SPRITES.neutral;
    if (coach.getAttribute('data-sprite') === key) return;
    coach.setAttribute('data-sprite', key);
    coach.classList.remove('jjh-talking');
    coach.classList.add('jjh-swap-out');
    setTimeout(function () {
      coach.src = src;
      coach.classList.remove('jjh-swap-out');
      coach.classList.add('jjh-swap-in');
    }, 200);
  }

  /* ── TYPEWRITER ──────────────────────────────────────────────────────────── */

  var _typeTimer = null;

  function typewrite(text, onDone) {
    if (_typeTimer) clearTimeout(_typeTimer);
    var textNode = document.getElementById('jjaHostText').childNodes[0];
    var cursor   = document.getElementById('jjaHostCursor');
    var dots     = document.getElementById('jjaHostDots');
    var coach    = document.getElementById('jjaHostCoach');

    textNode.nodeValue = '';
    cursor.classList.remove('jjh-hidden');
    dots.classList.add('jjh-show');
    if (coach) coach.classList.add('jjh-talking');

    var chars = text.split('');
    var i = 0;

    function delay(ch) {
      if (ch === ' ')                             return 22;
      if (ch === ',' || ch === ';')               return 95;
      if (ch === '.' || ch === '?' || ch === '!') return 130;
      return 28 + Math.random() * 16;
    }

    function tick() {
      if (i >= chars.length) {
        cursor.classList.add('jjh-hidden');
        dots.classList.remove('jjh-show');
        if (coach) coach.classList.remove('jjh-talking');
        if (onDone) onDone();
        return;
      }
      textNode.nodeValue += chars[i];
      i++;
      _typeTimer = setTimeout(tick, delay(chars[i - 1]));
    }
    tick();
  }

  function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ── PUBLIC API ──────────────────────────────────────────────────────────── */

  window.JJHangmanHost = {

    /* New game — neutral sprite + category intro */
    init: function (container, categoryId) {
      injectStyles();
      var existing = document.getElementById('jjaHangmanHost');
      if (existing) existing.remove();

      var hostEl = buildHostEl();
      container.insertBefore(hostEl, container.firstChild);

      setSprite('neutral');

      var catEl = document.getElementById('jjaHostCat');
      if (catEl && categoryId) {
        catEl.textContent = '📌 Category: ' + categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace(/-/g, ' ');
      }

      var pool = DIALOGUE.intro[categoryId] || DIALOGUE.intro['default'];
      typewrite(getRandom(pool));
    },

    /* Wrong guess — good-try sprite */
    onWrong: function (remainingGuesses) {
      setSprite('goodTry');
      var pool = (remainingGuesses <= 1) ? DIALOGUE.danger : DIALOGUE.wrong;
      typewrite(getRandom(pool));
    },

    /* Correct letter — nice sprite, then back to neutral after a beat */
    onCorrect: function () {
      setSprite('nice');
      typewrite(getRandom(DIALOGUE.correct), function () {
        setTimeout(function () { setSprite('neutral'); }, 1200);
      });
    },

    /* Win — nice sprite, stays */
    onWin: function () {
      setSprite('nice');
      typewrite(getRandom(DIALOGUE.win));
    },

    /* Lose — good-try sprite, stays */
    onLose: function () {
      setSprite('goodTry');
      typewrite(getRandom(DIALOGUE.lose));
    }
  };

})();