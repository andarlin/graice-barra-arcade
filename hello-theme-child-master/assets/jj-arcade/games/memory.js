(function () {
  window.JJGames = window.JJGames || {};

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function mount(root, gameConfig) {
    const pairs = Number(gameConfig.pairs || 6);
    const questions = Array.isArray(gameConfig.questions) ? gameConfig.questions : [];
    const cardsBase = Array.isArray(gameConfig.cards) ? gameConfig.cards : [];

    // Use first N cards
    const selected = cardsBase.slice(0, pairs);
    const deck = shuffle([...selected, ...selected].map((c, idx) => ({ ...c, _k: idx })));

    let flipped = [];
    let matched = 0;
    let moves = 0;
    let qCount = 0;
    let lock = false;
    let usedQ = [];

    // Optional: store answers picked
    let answers = [];

    root.innerHTML = `
      <div class="jj-memory">
        <header class="jj-memory__top">
          <div class="jj-memory__stats">
            <div>Moves: <span id="jj-moves">0</span></div>
            <div>Matches: <span id="jj-matches">0</span>/${pairs}</div>
            <div>Questions: <span id="jj-q">0</span></div>
          </div>
        </header>

        <div id="jj-board" class="jj-memory__board"></div>

        <div id="jj-question" class="jj-memory__question jj-hidden">
          <div class="jj-memory__question-card">
            <h3>Team Question</h3>
            <p id="jj-question-text"></p>
            <div id="jj-question-choices" class="jj-memory__choices"></div>
          </div>
        </div>

        <div id="jj-victory" class="jj-memory__victory jj-hidden">
          <div class="jj-memory__victory-card">
            <h3>Done!</h3>
            <p>Total moves: <strong id="jj-final-moves"></strong></p>
            <p>Questions answered: <strong id="jj-final-q"></strong></p>
            <button id="jj-restart" type="button">Play again</button>
          </div>
        </div>
      </div>
    `;

    const elBoard = root.querySelector("#jj-board");
    const elMoves = root.querySelector("#jj-moves");
    const elMatches = root.querySelector("#jj-matches");
    const elQ = root.querySelector("#jj-q");

    const elQuestionWrap = root.querySelector("#jj-question");
    const elQuestionText = root.querySelector("#jj-question-text");
    const elChoices = root.querySelector("#jj-question-choices");

    const elVictory = root.querySelector("#jj-victory");
    const elFinalMoves = root.querySelector("#jj-final-moves");
    const elFinalQ = root.querySelector("#jj-final-q");
    const elRestart = root.querySelector("#jj-restart");

    function renderBoard() {
      elBoard.innerHTML = "";
      deck.forEach((card, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "jj-card";
        btn.dataset.index = String(index);
        btn.dataset.id = String(card.id);

        btn.innerHTML = `
          <span class="jj-card__front">
            <img src="${(window.JJ_ARCADE_CONFIG && window.JJ_ARCADE_CONFIG.cardFront) ? window.JJ_ARCADE_CONFIG.cardFront : ''}" alt="GB Logo" />
          </span>
          <span class="jj-card__back">
            ${card.image ? `<img src="${card.image}" alt="${escapeHtml(card.label || card.id)}" />` : escapeHtml(card.label || card.id)}
          </span>
        `;
        btn.addEventListener("click", () => onFlip(btn));
        elBoard.appendChild(btn);
      });
    }

    function onFlip(btn) {
      if (lock) return;
      if (btn.classList.contains("is-flipped")) return;
      if (btn.classList.contains("is-matched")) return;
      if (flipped.length >= 2) return;

      btn.classList.add("is-flipped");
      flipped.push(btn);

      if (flipped.length === 2) {
        moves++;
        elMoves.textContent = String(moves);
        checkMatch();
      }
    }

    function checkMatch() {
      lock = true;
      const [a, b] = flipped;
      const match = a.dataset.id === b.dataset.id;

      if (match) {
        a.classList.add("is-matched");
        b.classList.add("is-matched");
        matched++;
        elMatches.textContent = String(matched);
        flipped = [];

        setTimeout(() => {
          if (matched === pairs) {
            showVictory();
          } else {
            showQuestion();
          }
        }, 350);
      } else {
        setTimeout(() => {
          a.classList.remove("is-flipped");
          b.classList.remove("is-flipped");
          flipped = [];
          lock = false;
        }, 650);
      }
    }

    function normalizeQuestion(item) {
      // Backwards compatible: strings become a question with default 3 choices
      if (typeof item === "string") {
        return {
          q: item,
          choices: ["Got it", "Sounds good", "Let’s go"]
        };
      }

      // Object format: { q: "...", choices: ["a","b","c"] }
      const q = item && typeof item.q === "string" ? item.q : "";
      const choicesRaw = item && Array.isArray(item.choices) ? item.choices : [];
      const choices = choicesRaw.slice(0, 3).map((c) => String(c));

      // Ensure exactly 3 choices exist
      while (choices.length < 3) choices.push(`Option ${choices.length + 1}`);

      return { q, choices };
    }

    function showQuestion() {
      if (!questions.length) {
        lock = false;
        return;
      }

      const pool = questions
        .map((_, i) => i)
        .filter((i) => !usedQ.includes(i));

      if (!pool.length) {
        usedQ = [];
        return showQuestion();
      }

      const idx = pool[Math.floor(Math.random() * pool.length)];
      usedQ.push(idx);

      const qq = normalizeQuestion(questions[idx]);

      qCount++;
      elQ.textContent = String(qCount);
      elQuestionText.textContent = qq.q;

      // Render 3 choice buttons
      elChoices.innerHTML = qq.choices
        .map((label, i) => `<button class="jj-choice-btn" type="button" data-choice="${i}">${escapeHtml(label)}</button>`)
        .join("");

      elQuestionWrap.classList.remove("jj-hidden");
      elBoard.classList.add("jj-dim");
    }

    function onPickChoice(choiceIndex) {
      // Save answer (optional)
      const pickedBtn = elChoices.querySelector(`[data-choice="${choiceIndex}"]`);
      answers.push({
        question: elQuestionText ? elQuestionText.textContent : "",
        choiceIndex,
        choice: pickedBtn ? pickedBtn.textContent : ""
      });

      // Close overlay and resume
      elQuestionWrap.classList.add("jj-hidden");
      elBoard.classList.remove("jj-dim");
      lock = false;
    }

    function showVictory() {
      elFinalMoves.textContent = String(moves);
      elFinalQ.textContent = String(qCount);
      elVictory.classList.remove("jj-hidden");
      elBoard.classList.add("jj-hidden");
      lock = true;
    }

    // Choice click handling (delegated)
    elChoices.addEventListener("click", (e) => {
      const btn = e.target.closest(".jj-choice-btn");
      if (!btn) return;
      if (lock === false) {
        // overlay should only appear when lock is true, but keep safe
      }
      const idx = Number(btn.dataset.choice || 0);
      onPickChoice(idx);
    });

    elRestart.addEventListener("click", () => {
      // reload current game config
      mount(root, gameConfig);
    });

    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    renderBoard();
  }

  window.JJGames.memory = { mount };
})();