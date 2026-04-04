(function () {
  'use strict';

  var BASE_PATH = '/wp-content/themes/hello-theme-child-master/assets/jj-arcade/cards/';
  var DATA_PATH = '/wp-content/themes/hello-theme-child-master/assets/jj-arcade/data/hangman.json';
  var MAX_WRONG = 6;

  var BODY_PARTS = [
    { id: 'hm-part-1', src: BASE_PATH + 'andar_1of6.png', label: 'Part 1' },
    { id: 'hm-part-2', src: BASE_PATH + 'andar_2of6.png', label: 'Part 2' },
    { id: 'hm-part-3', src: BASE_PATH + 'andar_3of6.png', label: 'Part 3' },
    { id: 'hm-part-4', src: BASE_PATH + 'andar_4of6.png', label: 'Part 4' },
    { id: 'hm-part-5', src: BASE_PATH + 'andar_5of6.png', label: 'Part 5' },
    { id: 'hm-part-6', src: BASE_PATH + 'andar_6of6.png', label: 'Part 6' },
  ];

  var allData = null;
  var currentWord = '';
  var currentHint = '';
  var guessedLetters = {};
  var wrongCount = 0;
  var gameOver = false;
  var currentCategory = 'techniques';
  var mountEl, wordDisplayEl, keyboardEl, wrongDisplayEl, hintEl, statusEl, newGameBtn, overlayEl;

  window.JJGames = window.JJGames || {};

  function mount(root, cfg) {
    mountEl = root;
    loadData().then(function () {
      render();
      bindEvents();
      startNewGame();
    });
  }

  function init(containerId) {
    var el = document.getElementById(containerId);
    if (el) mount(el, {});
  }

  function loadData() {
    return fetch(DATA_PATH)
      .then(function (r) { return r.json(); })
      .then(function (json) { allData = json.categories; })
      .catch(function () {
        allData = {
          techniques: {
            label: 'Techniques',
            words: [
              { word: 'ARMBAR',   hint: 'A joint lock targeting the elbow' },
              { word: 'TRIANGLE', hint: 'A choke using legs around neck and arm' },
              { word: 'KIMURA',   hint: 'A shoulder lock named after a legend' },
              { word: 'GUARD',    hint: 'Bottom position with legs around opponent' },
              { word: 'MOUNT',    hint: 'Sitting on your opponents chest' }
            ]
          }
        };
      });
  }

  function render() {
    mountEl.innerHTML =
      '<div class="hm-wrapper">' +
        '<div class="hm-categories" id="hm-categories"></div>' +
        '<div class="hm-main">' +
          '<div class="hm-character-panel">' +
            '<div class="hm-scaffold">' +
              '<div class="hm-parts-container" id="hm-parts-container">' +
                BODY_PARTS.map(function (p) {
                  return '<img id="' + p.id + '" src="' + p.src + '" alt="' + p.label + '" class="hm-body-part hm-part-hidden" draggable="false" />';
                }).join('') +
              '</div>' +
              '<div class="hm-wrong-count"><span id="hm-wrong-display">0</span> / ' + MAX_WRONG + ' wrong</div>' +
            '</div>' +
          '</div>' +
          '<div class="hm-game-panel">' +
            '<div class="hm-hint-badge" id="hm-hint">Loading...</div>' +
            '<div class="hm-word-display" id="hm-word-display"></div>' +
            '<div class="hm-status" id="hm-status"></div>' +
            '<div class="hm-keyboard" id="hm-keyboard"></div>' +
            '<button class="hm-new-game-btn" id="hm-new-game-btn">New Word</button>' +
          '</div>' +
        '</div>' +
        '<div class="hm-overlay hm-hidden" id="hm-overlay">' +
          '<div class="hm-overlay-box">' +
            '<div class="hm-overlay-emoji" id="hm-overlay-emoji"></div>' +
            '<div class="hm-overlay-msg" id="hm-overlay-msg"></div>' +
            '<div class="hm-overlay-word" id="hm-overlay-word"></div>' +
            '<button class="hm-new-game-btn hm-overlay-btn" id="hm-overlay-btn">Play Again</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    wordDisplayEl  = document.getElementById('hm-word-display');
    keyboardEl     = document.getElementById('hm-keyboard');
    wrongDisplayEl = document.getElementById('hm-wrong-display');
    hintEl         = document.getElementById('hm-hint');
    statusEl       = document.getElementById('hm-status');
    newGameBtn     = document.getElementById('hm-new-game-btn');
    overlayEl      = document.getElementById('hm-overlay');

    buildCategoryTabs();
    buildKeyboard();
  }

  function buildCategoryTabs() {
    var container = document.getElementById('hm-categories');
    if (!container || !allData) return;
    var VISIBLE_CATS = ['techniques', 'positions'];
    container.innerHTML = Object.keys(allData).filter(function (key) {
      return VISIBLE_CATS.indexOf(key) !== -1;
    }).map(function (key) {
      var cat = allData[key];
      return '<button class="hm-cat-btn ' + (key === currentCategory ? 'hm-cat-active' : '') + '" data-cat="' + key + '">' + cat.label + '</button>';
    }).join('');
  }

  function buildKeyboard() {
    if (!keyboardEl) return;
    keyboardEl.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (l) {
      return '<button class="hm-key" data-letter="' + l + '">' + l + '</button>';
    }).join('');
  }

  function startNewGame() {
    if (!allData) return;
    var cat = allData[currentCategory];
    var entry = cat.words[Math.floor(Math.random() * cat.words.length)];
    currentWord    = entry.word.toUpperCase().replace(/\s/g, '');
    currentHint    = entry.hint;
    guessedLetters = {};
    wrongCount     = 0;
    gameOver       = false;

    BODY_PARTS.forEach(function (p) {
      var el = document.getElementById(p.id);
      if (el) { el.classList.add('hm-part-hidden'); el.classList.remove('hm-part-visible'); }
    });
    document.querySelectorAll('.hm-key').forEach(function (btn) {
      btn.disabled = false;
      btn.classList.remove('hm-key-correct', 'hm-key-wrong');
    });
    if (hintEl)    hintEl.textContent = 'Hint: ' + currentHint;
    if (statusEl)  statusEl.textContent = '';
    if (overlayEl) overlayEl.classList.add('hm-hidden');
    updateWrongDisplay();
    updateWordDisplay();
  }

  function handleGuess(letter) {
    if (gameOver || guessedLetters[letter]) return;
    guessedLetters[letter] = true;
    var keyBtn = keyboardEl ? keyboardEl.querySelector('[data-letter="' + letter + '"]') : null;
    if (keyBtn) keyBtn.disabled = true;
    if (currentWord.indexOf(letter) !== -1) {
      if (keyBtn) keyBtn.classList.add('hm-key-correct');
      updateWordDisplay();
      checkWin();
    } else {
      if (keyBtn) keyBtn.classList.add('hm-key-wrong');
      revealBodyPart(wrongCount);
      wrongCount++;
      updateWrongDisplay();
      checkLoss();
    }
  }

  function revealBodyPart(index) {
    if (index >= BODY_PARTS.length) return;
    var el = document.getElementById(BODY_PARTS[index].id);
    if (el) { el.classList.remove('hm-part-hidden'); el.classList.add('hm-part-visible'); }
  }

  function updateWordDisplay() {
    if (!wordDisplayEl) return;
    wordDisplayEl.innerHTML = currentWord.split('').map(function (ch) {
      return '<span class="hm-letter-box ' + (guessedLetters[ch] ? 'hm-letter-revealed' : '') + '">' +
        (guessedLetters[ch] ? ch : '&nbsp;') + '</span>';
    }).join('');
  }

  function updateWrongDisplay() {
    if (wrongDisplayEl) wrongDisplayEl.textContent = wrongCount;
  }

  function checkWin() {
    var won = currentWord.split('').every(function (ch) { return guessedLetters[ch]; });
    if (won) { gameOver = true; showOverlay(true); }
  }

  function checkLoss() {
    if (wrongCount >= MAX_WRONG) {
      gameOver = true;
      currentWord.split('').forEach(function (ch) { guessedLetters[ch] = true; });
      updateWordDisplay();
      showOverlay(false);
    }
  }

  function showOverlay(won) {
    document.getElementById('hm-overlay-emoji').textContent = won ? 'OSS!' : 'The Professor wins!';
    document.getElementById('hm-overlay-msg').textContent   = won ? 'You got it!' : 'Not this time — keep training!';
    document.getElementById('hm-overlay-word').textContent  = 'The word was: ' + currentWord;
    if (overlayEl) overlayEl.classList.remove('hm-hidden');
  }

  function bindEvents() {
    if (keyboardEl) {
      keyboardEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.hm-key');
        if (btn && !btn.disabled) handleGuess(btn.getAttribute('data-letter'));
      });
    }
    var catContainer = document.getElementById('hm-categories');
    if (catContainer) {
      catContainer.addEventListener('click', function (e) {
        var btn = e.target.closest('.hm-cat-btn');
        if (!btn) return;
        currentCategory = btn.getAttribute('data-cat');
        document.querySelectorAll('.hm-cat-btn').forEach(function (b) { b.classList.remove('hm-cat-active'); });
        btn.classList.add('hm-cat-active');
        startNewGame();
      });
    }
    if (newGameBtn) newGameBtn.addEventListener('click', startNewGame);
    var overlayBtn = document.getElementById('hm-overlay-btn');
    if (overlayBtn) overlayBtn.addEventListener('click', function () {
      if (overlayEl) overlayEl.classList.add('hm-hidden');
      startNewGame();
    });
    document.addEventListener('keydown', function (e) {
      if (gameOver) return;
      var letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) handleGuess(letter);
    });
  }

  window.JJGames['hangman'] = { mount: mount, init: init };

})();