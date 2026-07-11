(function () {
  window.JJGames = window.JJGames || {};

  // Jiu-Jitsu Arcade v2: feedback layer -- every call is optional-chained so the
  // game runs unchanged if the shared utilities fail to load.
  const fx = {
    sfx: (key) => window.JJArcadeAudio && window.JJArcadeAudio.playSfx(key),
    vibe: (pattern) => window.JJArcadeAudio && window.JJArcadeAudio.vibrate(pattern),
    shake: (el) => window.JJArcadeJuice && window.JJArcadeJuice.shake(el),
    burst: (el) => window.JJArcadeJuice && window.JJArcadeJuice.burstFromEl(el),
    confetti: (el) => window.JJArcadeJuice && window.JJArcadeJuice.confetti(el),
  };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
    return res.json();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function mount(root, gameConfig) {
    const pairs     = Number(gameConfig.pairs || 6);
    const dataUrl   = String(gameConfig.dataUrl || '');
    const imageBase = String(
      gameConfig.imageBase ||
      (window.JJ_ARCADE_CONFIG && window.JJ_ARCADE_CONFIG.imageBase) ||
      ''
    ).replace(/\/$/, '');

    let deck    = [];
    let flipped = [];
    let matched = 0;
    let moves   = 0;
    let lock    = false;

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
            <button id="jj-restart" class="jja-pressable" type="button">Play again</button>
          </div>
        </div>
      </div>
    `;

    const elBoard      = root.querySelector('#jj-board');
    const elMoves      = root.querySelector('#jj-moves');
    const elMatches    = root.querySelector('#jj-matches');
    const elVictory    = root.querySelector('#jj-victory');
    const elFinalMoves = root.querySelector('#jj-final-moves');
    const elRestart    = root.querySelector('#jj-restart');

    // Inject image card styles once per page load
    if (!document.getElementById('jj-tm-img-styles')) {
      const style = document.createElement('style');
      style.id = 'jj-tm-img-styles';
      style.textContent = `
        .jj-card__back--img {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          overflow: hidden;
          border-radius: inherit;
        }
        .jj-card__back--img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: inherit;
          display: block;
        }
        .jj-tm__name {
          font-weight: 700;
          font-size: 1.05rem;
          text-align: center;
          padding: 8px;
          line-height: 1.3;
          color: #fff;
        }
      `;
      document.head.appendChild(style);
    }

    function buildDeckFromItems(items) {
      const selected = items.slice(0, pairs);
      const cards = [];

      selected.forEach((it) => {
        const id   = String(it.id   || it.name || '');
        const name = String(it.name || '');

        // Card A — technique name (text, same as before)
        cards.push({ id, kind: 'name', text: name });

        // Card B — student photo using the shared /cards/ filename convention
        // Filenames on server: armbar.png, triangle-choke.png, kimura.png,
        //                      mount-position.png, closed-guard.png, side-control-position.png
        cards.push({ id, kind: 'img', imgSrc: `${imageBase}/${id}.png` });
      });

      return shuffle(cards.map((c, idx) => ({ ...c, _k: idx })));
    }

    function renderBoard() {
      elBoard.innerHTML = '';

      deck.forEach((card, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'jj-card jja-pressable';
        btn.dataset.index = String(index);
        btn.dataset.id    = String(card.id);
        btn.dataset.kind  = String(card.kind);

        const frontImg =
          gameConfig.cardFront ||
          (window.JJ_ARCADE_CONFIG && window.JJ_ARCADE_CONFIG.cardFront) ||
          '';

        // Back face — image card or name card
        const backFace = card.kind === 'img'
          ? `<span class="jj-card__back jj-card__back--img">
               <img src="${escapeHtml(card.imgSrc)}"
                    alt="${escapeHtml(card.id)}"
                    loading="lazy" />
             </span>`
          : `<span class="jj-card__back">
               <div class="jj-tm__name">${escapeHtml(card.text)}</div>
             </span>`;

        btn.innerHTML = `
          <span class="jj-card__front">
            ${frontImg
              ? `<img src="${escapeHtml(frontImg)}" alt="GB Logo" />`
              : `<span>?</span>`}
          </span>
          ${backFace}
        `;

        btn.addEventListener('click', () => onFlip(btn));
        elBoard.appendChild(btn);
      });
    }

    function onFlip(btn) {
      if (lock) return;
      if (btn.classList.contains('is-flipped')) return;
      if (btn.classList.contains('is-matched')) return;
      if (flipped.length >= 2) return;

      fx.sfx('ui_tap'); // card flip sound
      btn.classList.add('is-flipped');
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

      // Match = same technique id AND one is 'name', other is 'img'
      const sameId   = a.dataset.id   === b.dataset.id;
      const diffKind = a.dataset.kind !== b.dataset.kind;
      const match    = sameId && diffKind;

      if (match) {
        fx.sfx('correct'); // correct match chime
        fx.vibe('short');
        fx.burst(a);
        fx.burst(b);
        a.classList.add('is-matched');
        b.classList.add('is-matched');
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
        fx.sfx('wrong'); // wrong match buzz
        fx.vibe('double');
        fx.shake(a);
        fx.shake(b);
        setTimeout(() => {
          a.classList.remove('is-flipped');
          b.classList.remove('is-flipped');
          flipped = [];
          lock = false;
        }, 650);
      }
    }

    function showVictory() {
      elFinalMoves.textContent = String(moves);
      elVictory.classList.remove('jj-hidden');
      elBoard.classList.add('jj-hidden');
      lock = true;
      fx.sfx('fanfare'); // completion fanfare
      fx.vibe('win');
      fx.confetti(elVictory.querySelector('.jj-memory__victory-card') || elVictory);
    }

    elRestart.addEventListener('click', () => {
      fx.sfx('ui_tap');
      mount(root, gameConfig);
    });

    (async function init() {
      try {
        if (!dataUrl) throw new Error('Missing dataUrl in game config.');
        const data  = await fetchJSON(dataUrl);
        const items = Array.isArray(data.items) ? data.items : [];
        if (!items.length) throw new Error('No items found in technique-match.json');

        deck    = buildDeckFromItems(items);
        flipped = [];
        matched = 0;
        moves   = 0;
        lock    = false;
        elMoves.textContent   = '0';
        elMatches.textContent = '0';

        renderBoard();
      } catch (e) {
        elBoard.innerHTML = `<p style="padding:12px;opacity:.85;">${escapeHtml(e.message)}</p>`;
      }
    })();
  }

  window.JJGames['technique-match'] = { mount };
})();