(function () {
  const config = window.JJ_ARCADE_CONFIG || {};
  const games = Array.isArray(config.games) ? config.games : [];

  const els = {
    title:    document.getElementById("jj-arcade-title"),
    subtitle: document.getElementById("jj-arcade-subtitle"),
    list:     document.getElementById("jj-arcade-game-list"),
    stage:    document.getElementById("jj-arcade-stage"),
  };

  function setHeader() {
    if (els.title)    els.title.textContent    = config.pageTitle    || "Jiu-Jitsu Arcade";
    if (els.subtitle) els.subtitle.textContent = config.pageSubtitle || "Fun + skill-building games for students and families.";
  }

  function renderGameList() {
    if (!els.list) return;
    els.list.innerHTML = "";
    games.forEach((g) => {
      const btn = document.createElement("button");
      btn.className = "jj-arcade__game-btn";
      btn.type = "button";
      btn.dataset.gameId = g.id;
      btn.innerHTML =
        `<span class="jj-arcade__game-icon">${escapeHtml(g.icon || "🎮")}</span>` +
        `<span class="jj-arcade__game-title">${escapeHtml(g.title || g.id)}</span>`;
      btn.addEventListener("click", () => loadGame(g.id));
      els.list.appendChild(btn);
    });
  }

  function getGameModule(game) {
    if (!game) return null;
    const w = window.JJGames || {};

    // Try every likely key
    const keys = [
      game.mountKey,
      game.type,
      game.id,
      String(game.type || "").replace(/-/g, ""),
      String(game.id   || "").replace(/-/g, ""),
    ].filter(Boolean);

    for (const k of keys) {
      if (w[k] && typeof w[k].mount === "function") return w[k];
    }

    // Hard aliases for known games
    const slug = String(game.id || game.type || "").toLowerCase();
    if (slug.includes("technique") || slug.includes("match")) {
      return w.techniqueMatch || w["technique-match"] || w.techniquematch || null;
    }
    if (slug.includes("hangman")) {
      return w.hangman || w.JJHangman || null;
    }
    if (slug.includes("belt")) {
      return w.beltOrder || w["belt-order"] || w.beltorder || null;
    }
    if (slug.includes("memory")) {
      return w.memory || w.memoryGame || w["memory-game"] || null;
    }

    return null;
  }

  function waitForModule(game, timeoutMs = 4000) {
    const started = Date.now();
    return new Promise((resolve) => {
      (function tick() {
        const mod = getGameModule(game);
        if (mod) return resolve(mod);
        if (Date.now() - started > timeoutMs) return resolve(null);
        setTimeout(tick, 50);
      })();
    });
  }

  async function loadGame(gameId) {
    const game = games.find((g) => g.id === gameId);
    if (!game || !els.stage) return;

    // Highlight active button
    els.list && els.list.querySelectorAll(".jj-arcade__game-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.gameId === gameId);
    });

    els.stage.innerHTML = `<p style="opacity:.5;padding:24px;">Loading ${escapeHtml(game.title || gameId)}…</p>`;

    const mod = await waitForModule(game);

    if (mod && typeof mod.mount === "function") {
      els.stage.innerHTML = "";
      mod.mount(els.stage, game);
      return;
    }

    els.stage.innerHTML = `<p style="padding:24px;">⚠️ Game module not loaded. Check the console for script errors.</p>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

// Init
  setHeader();
  renderGameList();
  var firstGame = games[0];
  if (firstGame && firstGame.id) loadGame(firstGame.id);
})();