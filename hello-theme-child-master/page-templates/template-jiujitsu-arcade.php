<?php
/**
 * Template Name: Jiu-Jitsu Arcade
 * @package hello-theme-child-master
 * Version: 2.5.0 — JJA-019 coming-soon locked pills
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$child_uri = get_stylesheet_directory_uri();
$ver       = '2.5.0';
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
    <link rel="stylesheet" href="<?php echo $child_uri; ?>/assets/jj-arcade/jj-arcade.css?ver=<?php echo $ver; ?>">
    <link rel="stylesheet" href="<?php echo $child_uri; ?>/assets/jj-arcade/jj-memory-game.css?ver=<?php echo $ver; ?>">
    <link rel="stylesheet" href="<?php echo $child_uri; ?>/assets/jj-arcade/hangman.css?ver=<?php echo $ver; ?>">
    <style data-noptimize="1">
        body { margin: 0; background: #f5f5f5; }
        .jj-arcade-wrap { max-width: 1100px; margin: 0 auto; padding: 20px 16px 60px; font-family: 'Helvetica Neue', Arial, sans-serif; }
        .jj-arcade__header { text-align: center; margin-bottom: 28px; }
        .jj-arcade__header h1 { font-size: 2rem; font-weight: 800; color: #c0392b !important; margin: 0 0 6px; }
        .jj-arcade__header p { font-size: 1rem; color: #555; margin: 0; }

        /* ── Nav pills ─────────────────────────────────────── */
        .jj-arcade__nav { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 28px; }

        /* Live pills */
        .jj-arcade__nav-btn {
            padding: 8px 20px;
            border-radius: 999px;
            border: 2px solid #c0392b;
            background: #fff;
            color: #c0392b;
            font-weight: 600;
            font-size: 0.88rem;
            cursor: pointer;
            transition: background 0.2s, color 0.2s;
            white-space: nowrap;
        }
        .jj-arcade__nav-btn:hover,
        .jj-arcade__nav-btn.active { background: #c0392b; color: #fff; }

        /* Locked / coming-soon pills */
        .jj-arcade__nav-btn--locked {
            padding: 8px 20px;
            border-radius: 999px;
            border: 2px dashed #bbb;
            background: #f0f0f0;
            color: #999;
            font-weight: 600;
            font-size: 0.88rem;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s, color 0.15s;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .jj-arcade__nav-btn--locked:hover {
            background: #e8e8e8;
            border-color: #999;
            color: #666;
        }
        .jj-arcade__nav-btn--locked .lock-icon { font-size: 0.75rem; }

        /* ── Stage ─────────────────────────────────────────── */
        .jj-arcade__stage {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            padding: 28px 24px;
            min-height: 400px;
        }

        /* ── Coming-soon teaser panel ──────────────────────── */
        .jj-teaser {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 340px;
            text-align: center;
            padding: 32px 24px;
        }
        .jj-teaser__icon {
            font-size: 3.5rem;
            margin-bottom: 16px;
            opacity: 0.75;
        }
        .jj-teaser__badge {
            display: inline-block;
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffc107;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 3px 12px;
            margin-bottom: 14px;
        }
        .jj-teaser__title {
            font-size: 1.6rem;
            font-weight: 800;
            color: #222;
            margin: 0 0 10px;
        }
        .jj-teaser__desc {
            font-size: 0.95rem;
            color: #666;
            max-width: 420px;
            line-height: 1.6;
            margin: 0 auto 24px;
        }
        .jj-teaser__lock {
            font-size: 0.82rem;
            color: #aaa;
            margin-top: 8px;
        }
        .jj-teaser__lock span { font-size: 1rem; }

        /* Space Invaders iframe */
        .jj-space-invaders-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .jj-space-invaders-wrap iframe { width: 100%; max-width: 800px; height: 640px; border: none; border-radius: 8px; background: #000; display: block; }
        .jj-space-invaders-hint { font-size: 0.78rem; color: #888; text-align: center; }

        /* ── Mobile ────────────────────────────────────────── */
        @media (max-width: 600px) {
            .jj-arcade__header h1 { font-size: 1.5rem; }
            .jj-arcade__stage { padding: 16px 12px; }
            .jj-space-invaders-wrap iframe { height: 580px; }
            .jj-teaser__title { font-size: 1.3rem; }
        }
    </style>
</head>
<body <?php body_class('jj-arcade-page'); ?>>
<?php
if ( ! ( function_exists('elementor_theme_do_location') && elementor_theme_do_location('header') ) ) {
    get_template_part('template-parts/header/header', 'one');
}
?>
<main class="jj-arcade-wrap">
    <div class="jj-arcade__header">
        <h1>Jiu-Jitsu Arcade</h1>
        <p>Fun + skill-building games for students and families.</p>
    </div>

    <nav class="jj-arcade__nav" id="jj-arcade-nav">
        <!-- ── Live games ── -->
        <button class="jj-arcade__nav-btn active" data-game="memory">🃏 Memory Game</button>
        <button class="jj-arcade__nav-btn" data-game="technique-match">🥋 Technique Match</button>
        <button class="jj-arcade__nav-btn" data-game="hangman">🔤 JJ Hangman</button>
        <button class="jj-arcade__nav-btn" data-game="belt-order">🥇 Belt Order</button>
        <button class="jj-arcade__nav-btn" data-game="space-invaders">🚀 Space Invaders</button>
        <button class="jj-arcade__nav-btn" data-game="reaction-tap">⚡ Reaction Tap</button>

        <!-- ── Coming soon (locked) ── -->
        <button class="jj-arcade__nav-btn--locked" data-teaser="pac-man">
            <span class="lock-icon">🔒</span> JJ Pac-Man
        </button>
        <button class="jj-arcade__nav-btn--locked" data-teaser="trivia">
            <span class="lock-icon">🔒</span> BJJ Trivia
        </button>
        <button class="jj-arcade__nav-btn--locked" data-teaser="position-builder">
            <span class="lock-icon">🔒</span> Position Builder
        </button>
        <button class="jj-arcade__nav-btn--locked" data-teaser="scenario">
            <span class="lock-icon">🔒</span> Scenario Engine
        </button>
    </nav>

    <div class="jj-arcade__stage" id="jj-arcade-stage"></div>
</main>
<?php
if ( ! ( function_exists('elementor_theme_do_location') && elementor_theme_do_location('footer') ) ) {
    get_template_part('template-parts/footer/footer', 'one');
}
wp_footer();
?>

<!-- ── Game Scripts ─────────────────────────────────────────────────────── -->
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/memory.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/technique-match.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/hangman.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/belt-order.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/reaction-tap.js?ver=<?php echo $ver; ?>"></script>

<!-- ── Arcade Config + Router ─────────────────────────────────────────── -->
<script data-noptimize="1">
var CHILD_URI = '<?php echo $child_uri; ?>';

/* ─────────────────────────────────────────────────────────────
   ARCADE CONFIG
   ───────────────────────────────────────────────────────────── */
window.JJ_ARCADE_CONFIG = {
    cardFront: CHILD_URI + '/assets/jj-arcade/cards/jj-card-junior-1.png',
    games: [
        {
            id: 'memory', type: 'memory', title: 'GB Junior 1 Memory Game', pairs: 6,
            cards: [
                { id: 'junior_1', label: 'Junior Champ 1', image: CHILD_URI + '/assets/jj-arcade/cards/Junior_Champ_1.png' },
                { id: 'junior_2', label: 'Junior Champ 2', image: CHILD_URI + '/assets/jj-arcade/cards/Junior_Champ_2.png' },
                { id: 'junior_3', label: 'Junior Champ 3', image: CHILD_URI + '/assets/jj-arcade/cards/Junior_Champ_3.png' },
                { id: 'junior_4', label: 'Junior Champ 4', image: CHILD_URI + '/assets/jj-arcade/cards/Junior_Champ_4.png' },
                { id: 'little_1', label: 'Little Champ 1', image: CHILD_URI + '/assets/jj-arcade/cards/Little_Champ_1.png' },
                { id: 'little_2', label: 'Little Champ 2', image: CHILD_URI + '/assets/jj-arcade/cards/Little_Champ_2.png' }
            ],
            questions: [
                { q: 'What is one thing you do to be a great training partner?', choices: ['Be safe', 'Be respectful', 'Help others learn'] },
                { q: 'What position do you feel most confident in right now?', choices: ['Closed guard', 'Mount', 'Side control'] },
                { q: 'What is one goal you want to achieve this month?', choices: ['Train more', 'Learn a new move', 'Get stronger'] },
                { q: 'What is your favorite warm-up drill?', choices: ['Shrimping', 'Bear crawls', 'Forward rolls'] },
                { q: 'If you could improve one skill instantly, what would it be?', choices: ['Escapes', 'Guard retention', 'Takedowns'] }
            ]
        },
        {
            id: 'technique-match', type: 'technique-match', title: 'Technique Match', pairs: 6,
            cardFront:  CHILD_URI + '/assets/jj-arcade/cards/jj-card-technique-match.png',
            dataUrl:    CHILD_URI + '/assets/jj-arcade/data/technique-match.json',
            imageBase:  CHILD_URI + '/assets/jj-arcade/cards'
        },
        { id: 'hangman',    type: 'hangman',    title: 'JJ Hangman' },
        { id: 'belt-order', type: 'belt-order', title: 'Belt Order' },
        {
            id: 'space-invaders', type: 'iframe', title: 'Space Invaders',
            src: CHILD_URI + '/assets/jj-arcade/games/space-invaders-jj.html'
        },
        {
            id: 'reaction-tap', type: 'reaction-tap', title: 'Reaction Tap',
            dataUrl:   CHILD_URI + '/assets/jj-arcade/data/reaction-tap.json',
            assetBase: CHILD_URI + '/assets/jj-arcade/cards'
        }
    ]
};

/* ─────────────────────────────────────────────────────────────
   COMING SOON TEASER DATA
   Add / edit entries here when new games are announced.
   ───────────────────────────────────────────────────────────── */
var JJ_TEASERS = {
    'pac-man': {
        icon: '👾',
        title: 'JJ Pac-Man',
        desc:  'Navigate the mat, dodge opponents, and collect points in this BJJ-themed twist on a classic. Coming soon to the arcade!'
    },
    'trivia': {
        icon: '🧠',
        title: 'BJJ Trivia Quiz',
        desc:  'Test your knowledge of techniques, rules, belt ranks, and Gracie Barra history. How much do you really know?'
    },
    'position-builder': {
        icon: '🗺️',
        title: 'Position Builder',
        desc:  'Arrange techniques in the correct sequence and build your attack chain. Learn to think steps ahead on the mat.'
    },
    'scenario': {
        icon: '🎯',
        title: 'Scenario Engine',
        desc:  'Your opponent moves — what do you do? Make split-second decisions and see where your choices lead.'
    }
};

/* ─────────────────────────────────────────────────────────────
   ARCADE ROUTER
   ───────────────────────────────────────────────────────────── */
(function () {
    var stage    = document.getElementById('jj-arcade-stage');
    var liveBtns = document.querySelectorAll('.jj-arcade__nav-btn');
    var lockBtns = document.querySelectorAll('.jj-arcade__nav-btn--locked');

    /* ── Module resolution ── */
    function getGameModule(game) {
        if (!game) return null;
        var w    = window.JJGames || {};
        var keys = [
            game.mountKey,
            game.type,
            game.id,
            String(game.type || '').replace(/-/g, ''),
            String(game.id   || '').replace(/-/g, '')
        ].filter(Boolean);

        for (var i = 0; i < keys.length; i++) {
            if (w[keys[i]] && typeof w[keys[i]].mount === 'function') return w[keys[i]];
        }

        // Hard aliases for known registrations
        var slug = String(game.id || game.type || '').toLowerCase();
        if (slug.indexOf('technique') !== -1 || slug.indexOf('match') !== -1) {
            return w.techniqueMatch || w['technique-match'] || w.techniquematch || null;
        }
        if (slug.indexOf('hangman') !== -1) { return w.hangman || w.JJHangman || null; }
        if (slug.indexOf('belt') !== -1)    { return w.beltOrder || w['belt-order'] || w.beltorder || null; }
        if (slug.indexOf('memory') !== -1)  { return w.memory || w.memoryGame || w['memory-game'] || null; }
        return null;
    }

    function waitForModule(game, timeoutMs) {
        timeoutMs = timeoutMs || 6000;
        var started = Date.now();
        return new Promise(function (resolve) {
            (function tick() {
                var mod = getGameModule(game);
                if (mod) return resolve(mod);
                if (Date.now() - started > timeoutMs) return resolve(null);
                setTimeout(tick, 100);
            })();
        });
    }

    /* ── Iframe renderer (Space Invaders) ── */
    function loadIframe(cfg) {
        stage.innerHTML = '';
        var wrap   = document.createElement('div');
        wrap.className = 'jj-space-invaders-wrap';
        var iframe = document.createElement('iframe');
        iframe.src            = cfg.src;
        iframe.title          = cfg.title || 'Space Invaders';
        iframe.allowFullscreen = true;
        iframe.setAttribute('allow', 'autoplay');
        var hint = document.createElement('p');
        hint.className   = 'jj-space-invaders-hint';
        hint.textContent = '← → Arrow keys to move  |  Space to fire  |  Esc to pause  |  Works on mobile too';
        wrap.appendChild(iframe);
        wrap.appendChild(hint);
        stage.appendChild(wrap);
    }

    /* ── Coming-soon teaser renderer ── */
    function loadTeaser(teaserId) {
        var t = JJ_TEASERS[teaserId];
        if (!t) {
            stage.innerHTML = '<p style="padding:24px;color:#999;">Coming soon!</p>';
            return;
        }
        stage.innerHTML =
            '<div class="jj-teaser">' +
                '<div class="jj-teaser__icon">' + t.icon + '</div>' +
                '<div class="jj-teaser__badge">Coming Soon</div>' +
                '<h2 class="jj-teaser__title">' + escHtml(t.title) + '</h2>' +
                '<p class="jj-teaser__desc">' + escHtml(t.desc) + '</p>' +
                '<p class="jj-teaser__lock"><span>🔒</span> Available in a future update</p>' +
            '</div>';
    }

    /* ── Game loader ── */
    function loadGame(gameId) {
        stage.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Loading…</p>';

        var cfg  = null;
        var games = (window.JJ_ARCADE_CONFIG || {}).games || [];
        for (var i = 0; i < games.length; i++) {
            if (games[i].id === gameId) { cfg = games[i]; break; }
        }
        cfg = cfg || { id: gameId };

        // Iframe (Space Invaders)
        if (cfg.type === 'iframe') { loadIframe(cfg); return; }

        // Reaction Tap — dedicated branch (has its own dataUrl + assetBase)
        if (cfg.type === 'reaction-tap') {
            waitForModule(cfg).then(function (mod) {
                if (!mod) {
                    stage.innerHTML = '<p style="padding:24px;color:#c0392b;">Reaction Tap module not loaded. Check console.</p>';
                    return;
                }
                stage.innerHTML = '';
                mod.mount(stage, { dataUrl: cfg.dataUrl, assetBase: cfg.assetBase });
            });
            return;
        }

        // Standard module games
        if (!cfg.cardFront) { cfg.cardFront = (window.JJ_ARCADE_CONFIG || {}).cardFront; }

        waitForModule(cfg).then(function (mod) {
            if (!mod) {
                stage.innerHTML = '<p style="padding:24px;color:#c0392b;">Module not loaded: ' + escHtml(gameId) + '. Check console.</p>';
                return;
            }
            if (cfg.dataUrl) {
                fetch(cfg.dataUrl + '?v=<?php echo $ver; ?>')
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        var merged      = Object.assign({}, cfg, data);
                        merged.cardFront = cfg.cardFront;
                        merged.imageBase = cfg.imageBase;
                        stage.innerHTML  = '';
                        mod.mount(stage, merged);
                    })
                    .catch(function (e) {
                        stage.innerHTML = '<p style="color:red;padding:24px;">Failed to load config: ' + escHtml(e.message) + '</p>';
                    });
            } else {
                stage.innerHTML = '';
                mod.mount(stage, cfg);
            }
        });
    }

    /* ── XSS helper ── */
    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ── Active-pill helper ── */
    function clearActive() {
        liveBtns.forEach(function (b) { b.classList.remove('active'); });
        // locked pills never get 'active' — they have no active state
    }

    /* ── Live game pill click ── */
    liveBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            clearActive();
            btn.classList.add('active');
            loadGame(btn.getAttribute('data-game'));
        });
    });

    /* ── Locked pill click → teaser ── */
    lockBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            clearActive();          // remove active from any live pill
            loadTeaser(btn.getAttribute('data-teaser'));
        });
    });

    /* ── Boot — wait for memory module then load it ── */
    var _tries = 0;
    (function boot() {
        var mod = window.JJGames && window.JJGames['memory'];
        if (mod && typeof mod.mount === 'function') {
            loadGame('memory');
        } else if (_tries++ < 40) {
            setTimeout(boot, 200);
        } else {
            stage.innerHTML = '<p style="padding:24px;color:#c0392b;">Could not load Memory Game. Please refresh.</p>';
        }
    })();

})();
</script>
</body>
</html>