# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a WordPress child theme (`hello-theme-child-master`, based on the Hello Elementor theme) for the Gracie Barra Lake Country BJJ website. Its main purpose is the **Jiu-Jitsu Arcade**: a page template that hosts a set of standalone mini-games (memory match, hangman, belt ordering, trivia, etc.) for the school's students.

There is no build system, package manager, bundler, or test suite. It's hand-written PHP/vanilla JS/CSS deployed as-is. There is nothing to `npm install`, compile, or run tests for — treat every JS/CSS/PHP file as the deployed artifact itself.

## Deployment (the only "pipeline" in this repo)

`.github/workflows/deploy.yml` runs on every push to `master`:
- Installs `lftp` and mirrors the **`hello-theme-child-master/`** folder only, via SFTP, to the live WordPress install at `wp-content/themes/hello-theme-child-master` on IONOS.
- Credentials come from the `SFTP_HOST` / `SFTP_USERNAME` / `SFTP_PASSWORD` repo secrets.
- Root-level files (loose PNGs, `index.html`, `jj-arcade-project-board.html`) are **not** part of the theme folder and are never deployed — see "Non-deployed root files" below.

There's no staging environment or preview build. Pushing to `master` mirrors straight to production, so treat changes under `hello-theme-child-master/` as live-affecting.

## Architecture

### Request flow for the Arcade page

1. `hello-theme-child-master/functions.php` hooks `wp_enqueue_scripts` and, **only when the current page is `jiu-jitsu-arcade` or uses `template-jiujitsu-arcade.php`**, enqueues `jj-arcade.css`, `jj-arcade.js`, and `games/memory.js` + `games/technique-match.js`. It also reads `assets/jj-arcade/data/jj-arcade.json`, injects it as `window.JJ_ARCADE_CONFIG` via an inline script, and adds a default `cardFront` image.
2. `hello-theme-child-master/page-templates/template-jiujitsu-arcade.php` is the actual page template used for the Arcade page. It renders a full custom page (hero banner, horizontal game carousel, "coming soon" locked list, game stage) and **re-declares its own `window.JJ_ARCADE_CONFIG` and `JJA_GAME_META`/`JJ_TEASERS` objects inline**, then loads all game scripts directly via `<script src>` tags (not through `wp_enqueue_script`). Because this inline script runs after `wp_footer()`, **it overwrites the config that `functions.php` built from `jj-arcade.json`** — so for the live Arcade page, the hardcoded config inside the template is what's actually authoritative, not the JSON file. When adding/editing a game, update the config block in `template-jiujitsu-arcade.php`, not just the JSON.
3. The template's own inline "Arcade Router" IIFE (bottom of the file) handles clicking a carousel card: it resolves a game module, waits for it to register (scripts are async), and calls `mount()`.

There is a second, simpler router in `assets/jj-arcade/jj-arcade.js` with the same module-lookup/mount logic, used by the plain `assets/jj-arcade` list-style UI (see "Non-deployed root files" — this is what the root `index.html` prototype exercises). Keep both routers' alias-matching logic in sync if you change how a game registers itself.

### Game module convention

Every game under `assets/jj-arcade/games/*.js` is a self-contained IIFE that registers itself on a global registry:

```js
(function () {
  window.JJGames = window.JJGames || {};
  function mount(rootEl, config) { /* render game into rootEl */ }
  window.JJGames['some-id'] = { mount };
})();
```

- The router looks the module up by trying, in order: `game.mountKey`, `game.type`, `game.id`, and de-hyphenated variants, then falls back to substring matching (`technique`/`match`, `hangman`, `belt`, `memory`, `trivia`). If you add a new game id, make sure it matches one of these lookup paths or add a new alias branch in **both** routers.
- Because scripts load independently, the router polls (`waitForModule`) for up to a few seconds until `window.JJGames[id].mount` exists before mounting — a module isn't guaranteed to be ready synchronously.
- Two games are exceptions to the module pattern: `games/space-invaders-jj.html` and `games/dojo-dash.html` are fully standalone HTML documents loaded in an `<iframe>` (config `type: 'iframe'`), not mounted JS modules.
- Some games (`technique-match`, `reaction-tap`, `belt-explainer`) fetch their content from a JSON file in `assets/jj-arcade/data/` at mount time (`dataUrl` in the game config) rather than having content baked into the JS.

### Asset layout under `hello-theme-child-master/assets/jj-arcade/`

- `games/` — one JS module per game (IIFE + `window.JJGames[...]`), plus the two standalone iframe HTML games.
- `data/` — JSON content per game (trivia questions, hangman word lists, belt order, technique-match pairs, reaction-tap image sets, etc.).
- `cards/` — card/character images referenced by game configs (memory pairs, technique-match cards, belt icons, position-tap sprite sheets).
- `thumbnails/` — `.webp` thumbnails used by the carousel and hero background on the Arcade page.
- `jj-arcade.css`, `jj-memory-game.css`, `hangman.css` — shared/per-game stylesheets; the page template also carries a large block of page-chrome CSS inline (hero, carousel, stats bar) rather than in a stylesheet.

### Non-deployed root files

These live at the repo root, outside `hello-theme-child-master/`, so the deploy workflow never ships them. Don't assume they run against the live site:

- `index.html` — an older standalone prototype of the arcade shell. It references `jj-arcade.css`/`jj-memory-game.css`/`memory.js`/etc. by root-relative paths that don't actually exist at the repo root (the real files live under `hello-theme-child-master/assets/jj-arcade/`), so it's not directly runnable as-is.
- `jj-arcade-project-board.html` — a self-contained static kanban/project-tracking dashboard (its own inline CSS/JS) used for planning; not related to the game code.
- Loose `*.png` files at the root (belts, `Junior_Champ_*`, `andar_*of6`, etc.) — source/duplicate copies of images that are actually served from `hello-theme-child-master/assets/jj-arcade/cards/`.

## Conventions

- Commit messages are frequently prefixed with an internal ticket id, e.g. `JJA-023 sync Ionos master — add thumbnails...`. Follow this pattern (`JJA-0NN <summary>`) for related work when it maps to a tracked item on the project board.
- Cache-busting is manual: `template-jiujitsu-arcade.php` has a `$ver` string in its header comment/variable that's appended as `?ver=` to every asset URL and script tag in that file — bump it when you change CSS/JS/data the template references directly. `functions.php`'s own `wp_enqueue_*` calls use `filemtime()` instead, so those are automatic.
- PHP follows WordPress coding conventions (Yoda-ish conditionals, `esc_url()`/`esc_attr()` on output, `is_page()`/`is_page_template()` guards) — match this style in `functions.php` and the page template.
