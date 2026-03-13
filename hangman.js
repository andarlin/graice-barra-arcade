/**
 * JJ Arcade – Hangman Game
 * window.JJGames.hangman
 * 
 * Uses Professor Andar body-part images instead of a stick figure.
 * Body parts reveal in order: head → body → right_arm → left_arm → right_leg → left_leg
 * 
 * Image paths (relative to theme root):
 *   /wp-content/themes/hello-elementor/assets/jj-arcade/cards/head.png
 *   /wp-content/themes/hello-elementor/assets/jj-arcade/cards/body.png
 *   /wp-content/themes/hello-elementor/assets/jj-arcade/cards/right_arm.png
 *   /wp-content/themes/hello-elementor/assets/jj-arcade/cards/left_arm.png
 *   /wp-content/themes/hello-elementor/assets/jj-arcade/cards/right_leg.png
 *   /wp-content/themes/hello-elementor/assets/jj-arcade/cards/left_leg.png
 *
 * Max wrong guesses: 6 (one per body part)
 */

(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  const BASE_PATH = '/wp-content/themes/hello-elementor/assets/jj-arcade/cards/';
  const DATA_PATH = '/wp-content/themes/hello-elementor/assets/jj-arcade/data/hangman.json';
  const MAX_WRONG  = 6;

  const BODY_PARTS = [
    { id: 'hm-part-head',      src: BASE_PATH + 'head.png',      label: 'Head'      },
    { id: 'hm-part-body',      src: BASE_PATH + 'body.png',      label: 'Body'      },
    { id: 'hm-part-right-arm', src: BASE_PATH + 'right_arm.png', label: 'Right Arm' },
    { id: 'hm-part-left-arm',  src: BASE_PATH + 'left_arm.png',  label: 'Left Arm'  },
    { id: 'hm-part-right-leg', src: BASE_PATH + 'right_leg.png', label: 'Right Leg' },
    { id: 'hm-part-left-leg',  src: BASE_PATH + 'left_leg.png',  label: 'Left Leg'  },
  ];

  // ─── State ────────────────────────────────────────────────────────────────
  let allData        = null;
  let currentWord    = '';
  let currentHint    = '';
  let guessedLetters = new Set();
  let wrongCount     = 0;
  let gameOver       = false;
  let currentCategory = 'techniques';

  // ─── DOM refs (populated in init) ─────────────────────────────────────────
  let mountEl, wordDisplayEl, keyboardEl, wrongDisplayEl,
      hintEl, statusEl, newGameBtn, categoryBtns, overlayEl;

  // ─── Public API ───────────────────────────────────────────────────────────
  window.JJGames = window.JJGames || {};
  window.JJGames.hangman = { init };

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init(containerId) {
    mountEl = document.getElementById(containerId);
    if (!mountEl) { console.error('[Hangman] Container not found:', containerId); return; }

    loadData().then(() => {
      render();
      bindEvents();
      startNewGame();
    });
  }

  // ─── Data ─────────────────────────────────────────────────────────────────
  async function loadData() {
    try {
      const res  = await fetch(DATA_PATH);
      const json = await res.json();
      allData = json.categories;
    } catch (e) {
      console.error('[Hangman] Failed to load data, using fallback', e);
      allData = {
        techniques: {
          label: 'Techniques',
          words: [
            { word: 'ARMBAR',    hint: 'A joint lock on the elbow' },
            { word: 'TRIANGLE',  hint: 'A choke using legs around neck and arm' },
            { word: 'KIMURA',    hint: 'A shoulder lock named after a legend' },
            { word: 'GUARD',     hint: 'Bottom position with legs around opponent' },
            { word: 'MOUNT',     hint: 'Sitting on your opponent\'s chest' },
          ]
        }
      };
    }
  }

  // ─── Render HTML ──────────────────────────────────────────────────────────
  function render() {
    mountEl.innerHTML = `
      <div class="hm-wrapper">

        <!-- Category Tabs -->
        <div class="hm-categories" id="hm-categories"></div>

        <div class="hm-main">

          <!-- LEFT: Character -->
          <div class="hm-character-panel">
            <div class="hm-scaffold">
              <div class="hm-parts-container" id="hm-parts-container">
                ${BODY_PARTS.map(p => `
                  <img
                    id="${p.id}"
                    src="${p.src}"
                    alt="${p.label}"
                    class="hm-body-part hm-part-hidden"
                    draggable="false"
                  />`).join('')}
              </div>
              <div class="hm-wrong-count">
                <span id="hm-wrong-display">0</span> / ${MAX_WRONG} wrong
              </div>
            </div>
          </div>

          <!-- RIGHT: Game Area -->
          <div class="hm-game-panel">

            <div class="hm-hint-badge" id="hm-hint">Hint will appear here</div>

            <div class="hm-word-display" id="hm-word-display"></div>

            <div class="hm-status" id="hm-status"></div>

            <div class="hm-keyboard" id="hm-keyboard"></div>

            <button class="hm-new-game-btn" id="hm-new-game-btn">⚡ New Word</button>
          </div>
        </div>

        <!-- Win/Lose Overlay -->
        <div class="hm-overlay hm-hidden" id="hm-overlay">
          <div class="hm-overlay-box">
            <div class="hm-overlay-emoji" id="hm-overlay-emoji"></div>
            <div class="hm-overlay-msg"   id="hm-overlay-msg"></div>
            <div class="hm-overlay-word"  id="hm-overlay-word"></div>
            <button class="hm-new-game-btn hm-overlay-btn" id="hm-overlay-btn">Play Again</button>
          </div>
        </div>

      </div>`;

    // Cache refs
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
    const container = document.getElementById('hm-categories');
    if (!container || !allData) return;
    container.innerHTML = Object.entries(allData).map(([key, cat]) => `
      <button
        class="hm-cat-btn ${key === currentCategory ? 'hm-cat-active' : ''}"
        data-cat="${key}"
      >${cat.label}</button>
    `).join('');
  }

  function buildKeyboard() {
    if (!keyboardEl) return;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    keyboardEl.innerHTML = letters.map(l => `
      <button class="hm-key" data-letter="${l}">${l}</button>
    `).join('');
  }

  // ─── Game Logic ───────────────────────────────────────────────────────────
  function startNewGame() {
    if (!allData) return;

    const cat   = allData[currentCategory];
    const entry = cat.words[Math.floor(Math.random() * cat.words.length)];

    currentWord    = entry.word.toUpperCase().replace(/\s/g, '');
    currentHint    = entry.hint;
    guessedLetters = new Set();
    wrongCount     = 0;
    gameOver       = false;

    // Reset body parts
    BODY_PARTS.forEach(p => {
      const el = document.getElementById(p.id);
      if (el) { el.classList.add('hm-part-hidden'); el.classList.remove('hm-part-visible'); }
    });

    // Reset keyboard
    document.querySelectorAll('.hm-key').forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('hm-key-correct', 'hm-key-wrong');
    });

    hintEl.textContent = `💡 ${currentHint}`;
    statusEl.textContent = '';
    overlayEl.classList.add('hm-hidden');

    updateWrongDisplay();
    updateWordDisplay();
  }

  function handleGuess(letter) {
    if (gameOver || guessedLetters.has(letter)) return;

    guessedLetters.add(letter);

    const keyBtn = keyboardEl.querySelector(`[data-letter="${letter}"]`);
    if (keyBtn) keyBtn.disabled = true;

    if (currentWord.includes(letter)) {
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
    const el = document.getElementById(BODY_PARTS[index].id);
    if (el) {
      el.classList.remove('hm-part-hidden');
      el.classList.add('hm-part-visible');
    }
  }

  function updateWordDisplay() {
    if (!wordDisplayEl) return;
    wordDisplayEl.innerHTML = currentWord.split('').map(ch => `
      <span class="hm-letter-box ${guessedLetters.has(ch) ? 'hm-letter-revealed' : ''}">
        ${guessedLetters.has(ch) ? ch : '&nbsp;'}
      </span>
    `).join('');
  }

  function updateWrongDisplay() {
    if (wrongDisplayEl) wrongDisplayEl.textContent = wrongCount;
  }

  function checkWin() {
    const won = currentWord.split('').every(ch => guessedLetters.has(ch));
    if (won) {
      gameOver = true;
      showOverlay(true);
    }
  }

  function checkLoss() {
    if (wrongCount >= MAX_WRONG) {
      gameOver = true;
      // Reveal all remaining letters
      currentWord.split('').forEach(ch => guessedLetters.add(ch));
      updateWordDisplay();
      showOverlay(false);
    }
  }

  function showOverlay(won) {
    document.getElementById('hm-overlay-emoji').textContent = won ? '🥋🏆' : '😅';
    document.getElementById('hm-overlay-msg').textContent   = won
      ? 'OSS! You got it!'
      : 'Not this time — the Professor wins!';
    document.getElementById('hm-overlay-word').textContent  = `The word was: ${currentWord}`;
    overlayEl.classList.remove('hm-hidden');
  }

  // ─── Events ───────────────────────────────────────────────────────────────
  function bindEvents() {
    // Keyboard clicks
    keyboardEl.addEventListener('click', e => {
      const btn = e.target.closest('.hm-key');
      if (btn && !btn.disabled) handleGuess(btn.dataset.letter);
    });

    // Category tabs
    document.getElementById('hm-categories').addEventListener('click', e => {
      const btn = e.target.closest('.hm-cat-btn');
      if (!btn) return;
      currentCategory = btn.dataset.cat;
      document.querySelectorAll('.hm-cat-btn').forEach(b => b.classList.remove('hm-cat-active'));
      btn.classList.add('hm-cat-active');
      startNewGame();
    });

    // New game button
    newGameBtn.addEventListener('click', startNewGame);

    // Overlay play again
    document.getElementById('hm-overlay-btn').addEventListener('click', () => {
      overlayEl.classList.add('hm-hidden');
      startNewGame();
    });

    // Physical keyboard support
    document.addEventListener('keydown', e => {
      if (gameOver) return;
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) handleGuess(letter);
    });
  }

})();
