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

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
    return res.json();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function mount(root, gameConfig) {
    const pairs = Number(gameConfig.pairs || 6);
    const dataUrl = String(gameConfig.dataUrl || "");

    let deck = [];
    let flipped = [];
    let matched = 0;
    let moves = 0;
    let lock = false;

    root.innerHTML = `
      <div class="jj-memory">
        <header class="jj-memory__top">
          <div class="jj-memory__stats">
            <div>Moves: <span id="jj-moves">0</span></div>
            <div>Matches: <span id="jj-matches">0</span>/${pairs}</div>
          </div>
        </header>

        <div id="jj-board" class="jj-memory__board"></div>

        <div id="jj-victory" class="jj-memory__victory jj-hidden">
          <div class="jj-memory__victory-card">
            <h3>Done!</h3>
            <p>Total moves: <strong id="jj-final-moves"></strong></p>
            <button id="jj-restart" type="button">Play again</button>
          </div>
        </div>
      </div>
    `;

    const elBoard = root.querySelector("#jj-board");
    const elMoves = root.querySelector("#jj-moves");
    const elMatches = root.querySelector("#jj-matches");

    const elVictory = root.querySelector("#jj-victory");
    const elFinalMoves = root.querySelector("#jj-final-moves");
    const elRestart = root.querySelector("#jj-restart");

    function buildDeckFromItems(items) {
      const selected = items.slice(0, pairs);

      // create two cards per item: (name) and (description)
      const cards = [];
      selected.forEach((it) => {
        const id = String(it.id || it.name || "");
        const name = String(it.name || "");
        const desc = String(it.desc || it.description || "");

        cards.push({ id, kind: "name", text: name });
        cards.push({ id, kind: "desc", text: desc });
      });

      return shuffle(cards.map((c, idx) => ({ ...c, _k: idx })));
    }

    function renderBoard() {
      elBoard.innerHTML = "";

      deck.forEach((card, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "jj-card";
        btn.dataset.index = String(index);
        btn.dataset.id = String(card.id);
        btn.dataset.kind = String(card.kind);

        // front uses global cardFront like memory.js does
        const frontImg =
          (window.JJ_ARCADE_CONFIG && window.JJ_ARCADE_CONFIG.cardFront)
            ? window.JJ_ARCADE_CONFIG.cardFront
            : "";

        // back text: name cards short + bold, desc cards slightly smaller
        const back =
          card.kind === "name"
            ? `<div class="jj-tm__name">${escapeHtml(card.text)}</div>`
            : `<div class="jj-tm__desc">${escapeHtml(card.text)}</div>`;

        btn.innerHTML = `
          <span class="jj-card__front">
            ${frontImg ? `<img src="${frontImg}" alt="GB Logo" />` : `<span>?</span>`}
          </span>
          <span class="jj-card__back">${back}</span>
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

      const sameId = a.dataset.id === b.dataset.id;
      const differentKind = a.dataset.kind !== b.dataset.kind;
      const match = sameId && differentKind;

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
            lock = false;
          }
        }, 250);
      } else {
        setTimeout(() => {
          a.classList.remove("is-flipped");
          b.classList.remove("is-flipped");
          flipped = [];
          lock = false;
        }, 650);
      }
    }

    function showVictory() {
      elFinalMoves.textContent = String(moves);
      elVictory.classList.remove("jj-hidden");
      elBoard.classList.add("jj-hidden");
      lock = true;
    }

    elRestart.addEventListener("click", () => {
      mount(root, gameConfig);
    });

    // Load data then render
    (async function init() {
      try {
        if (!dataUrl) throw new Error("Missing dataUrl in game config.");

        const data = await fetchJSON(dataUrl);
        const items = Array.isArray(data.items) ? data.items : [];

        if (!items.length) throw new Error("No items found in technique-match.json");

        deck = buildDeckFromItems(items);

        // reset stats
        flipped = [];
        matched = 0;
        moves = 0;
        lock = false;
        elMoves.textContent = "0";
        elMatches.textContent = "0";

        renderBoard();
      } catch (e) {
        elBoard.innerHTML = `<p style="padding:12px;opacity:.85;">${escapeHtml(e.message)}</p>`;
      }
    })();
  }

  // IMPORTANT: register under the exact key your arcade loader can find
  window.JJGames["technique-match"] = { mount };
})();