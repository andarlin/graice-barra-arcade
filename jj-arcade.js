(function () {
  const config = window.JJ_ARCADE_CONFIG || {};
  const games = Array.isArray(config.games) ? config.games : [];

  const els = {
    title: document.getElementById("jj-arcade-title"),
    subtitle: document.getElementById("jj-arcade-subtitle"),
    list: document.getElementById("jj-arcade-game-list"),
    stage: document.getElementById("jj-arcade-stage"),
  };

  function setHeader() {
    if (els.title) els.title.textContent = config.pageTitle || "Jiu-Jitsu Arcade";
    if (els.subtitle) els.subtitle.textContent = config.pageSubtitle || "Pick a game to play.";
  }

  function renderGameList() {
    if (!els.list) return;
    els.list.innerHTML = "";

    games.forEach((g) => {
      const btn = document.createElement("button");
      btn.className = "jj-arcade__game-btn";
      btn.type = "button";
      btn.innerHTML = `
        <div class="jj-arcade__game-title">${escapeHtml(g.title || g.id)}</div>
        <div class="jj-arcade__game-desc">${escapeHtml(g.description || "")}</div>
      `;
      btn.addEventListener("click", () => loadGame(g.id));
      els.list.appendChild(btn);
    });
  }

  /**
   * Resolve the game module using a few fallbacks:
   * - Prefer explicit game.mountKey if you ever add it later
   * - Then game.type (e.g. "memory", "technique-match")
   * - Then game.id (e.g. "memory", "technique-match")
   */
  function getGameModule(game) {
    if (!game) return null;

    // 1) optional explicit mount key
    if (game.mountKey && window.JJGames && window.JJGames[game.mountKey]) {
      return window.JJGames[game.mountKey];
    }

    // 2) use type as registry key
    if (game.type && window.JJGames && window.JJGames[game.type]) {
      return window.JJGames[game.type];
    }

    // 3) use id as registry key
    if (game.id && window.JJGames && window.JJGames[game.id]) {
      return window.JJGames[game.id];
    }

    // 4) compatibility aliases (in case you name the module differently)
    const type = String(game.type || "").toLowerCase();
    const id = String(game.id || "").toLowerCase();

    // technique-match aliases
    if (type === "technique-match" || id === "technique-match" || type === "technique_match" || id === "technique_match") {
      return window.JJGames?.techniqueMatch || window.JJGames?.["technique-match"] || null;
    }

    return null;
  }

function waitForModule(game, timeoutMs = 3000) {
  const started = Date.now();

  return new Promise((resolve) => {
    (function tick() {
      const mod = getGameModule(game);
      if (mod && typeof mod.mount === "function") return resolve(mod);

      if (Date.now() - started > timeoutMs) return resolve(null);
      setTimeout(tick, 50);
    })();
  });
}

async function loadGame(gameId) {
  const game = games.find((g) => g.id === gameId);
  if (!game) return;

  if (!els.stage) return;
  els.stage.innerHTML = "";

  const mod = await waitForModule(game);

  if (mod && typeof mod.mount === "function") {
    mod.mount(els.stage, game);
    return;
  }

  els.stage.innerHTML = `
    <p><strong>Game module not found:</strong> ${escapeHtml(gameId)}</p>
    <p style="opacity:.8;margin-top:8px;">
      Module not registered yet. This is usually caused by deferred/optimized script execution order.
    </p>
  `;
}
  
async function loadGame(gameId) {
  const game = games.find((g) => g.id === gameId);
  if (!game) return;

  if (!els.stage) return;
  els.stage.innerHTML = "";

  const mod = await waitForModule(game);

  if (mod && typeof mod.mount === "function") {
    mod.mount(els.stage, game);
    return;
  }

  els.stage.innerHTML = `
    <p><strong>Game module not found:</strong> ${escapeHtml(gameId)}</p>
    <p style="opacity:.8;margin-top:8px;">
      Module not registered yet. This is usually caused by deferred or optimized script execution order.
    </p>
  `;
}

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Init
  setHeader();
  renderGameList();
  if (games[0]?.id) loadGame(games[0].id);
})();