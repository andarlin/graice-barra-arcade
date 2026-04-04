<?php
/**
 * Template Name: Jiu-Jitsu Arcade
 * @package hello-theme-child-master
 * Version: 2.4.1 — JJA-013-B technique-match image cards
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$child_uri = get_stylesheet_directory_uri();
$ver       = '2.4.1';
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
        .jj-arcade__nav { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 28px; }
        .jj-arcade__nav-btn { padding: 8px 20px; border-radius: 999px; border: 2px solid #c0392b; background: #fff; color: #c0392b; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: background 0.2s, color 0.2s; white-space: nowrap; }
        .jj-arcade__nav-btn:hover, .jj-arcade__nav-btn.active { background: #c0392b; color: #fff; }
        .jj-arcade__stage { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 28px 24px; min-height: 400px; }

        /* Space Invaders iframe container */
        .jj-space-invaders-wrap { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .jj-space-invaders-wrap iframe { width: 100%; max-width: 800px; height: 640px; border: none; border-radius: 8px; background: #000; display: block; }
        .jj-space-invaders-hint { font-size: 0.78rem; color: #888; text-align: center; }

        @media (max-width: 600px) {
            .jj-arcade__header h1 { font-size: 1.5rem; }
            .jj-arcade__stage { padding: 16px 12px; }
            .jj-space-invaders-wrap iframe { height: 580px; }
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
        <button class="jj-arcade__nav-btn active" data-game="memory">🃏 Memory Game</button>
        <button class="jj-arcade__nav-btn" data-game="technique-match">🥋 Technique Match</button>
        <button class="jj-arcade__nav-btn" data-game="hangman">🔤 JJ Hangman</button>
        <button class="jj-arcade__nav-btn" data-game="belt-order">🥇 Belt Order</button>
        <button class="jj-arcade__nav-btn" data-game="space-invaders">🚀 Space Invaders</button>
        <button class="jj-arcade__nav-btn" data-game="reaction-tap">⚡ Reaction Tap</button>
    </nav>
    <div class="jj-arcade__stage" id="jj-arcade-stage"></div>
</main>
<?php
if ( ! ( function_exists('elementor_theme_do_location') && elementor_theme_do_location('footer') ) ) {
    get_template_part('template-parts/footer/footer', 'one');
}
wp_footer();
?>

<!-- ── Game Scripts ──────────────────────────────────────────────────────── -->
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/memory.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/technique-match.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/hangman.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/belt-order.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/reaction-tap.js?ver=<?php echo $ver; ?>"></script>

<!-- ── Arcade Config + Router ────────────────────────────────────────────── -->
<script data-noptimize="1">
var CHILD_URI = '<?php echo $child_uri; ?>';

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

(function () {
    var stage   = document.getElementById('jj-arcade-stage');
    var navBtns = document.querySelectorAll('.jj-arcade__nav-btn');
    var current = null;

    var gameMap = {
        'memory':          { key: 'memory' },
        'technique-match': { key: 'technique-match' },
        'hangman':         { key: 'hangman' },
        'belt-order':      { key: 'belt-order' },
        'space-invaders':  { key: 'iframe' },
        'reaction-tap':    { key: 'reaction-tap' }
    };

    function waitForModule(key, cb) {
        var started = Date.now();
        (function tick() {
            var mod = window.JJGames && window.JJGames[key];
            if (mod && typeof mod.mount === 'function') return cb(mod);
            if (Date.now() - started > 6000) return cb(null);
            setTimeout(tick, 100);
        })();
    }

    function loadIframe(cfg) {
        stage.innerHTML = '';
        var wrap = document.createElement('div');
        wrap.className = 'jj-space-invaders-wrap';
        var iframe = document.createElement('iframe');
        iframe.src = cfg.src;
        iframe.title = cfg.title || 'Space Invaders';
        iframe.allowFullscreen = true;
        iframe.setAttribute('allow', 'autoplay');
        var hint = document.createElement('p');
        hint.className = 'jj-space-invaders-hint';
        hint.textContent = '← → Arrow keys to move  |  Space to fire  |  Esc to pause  |  Works on mobile too';
        wrap.appendChild(iframe);
        wrap.appendChild(hint);
        stage.appendChild(wrap);
    }

    function loadGame(gameId) {
        current = null;
        stage.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Loading...</p>';

        var def = gameMap[gameId];
        if (!def) { stage.innerHTML = '<p>Game not found.</p>'; return; }

        var cfg = null;
        var games = window.JJ_ARCADE_CONFIG.games || [];
        for (var i = 0; i < games.length; i++) {
            if (games[i].id === gameId) { cfg = games[i]; break; }
        }
        cfg = cfg || { id: gameId };

        // Iframe games (Space Invaders standalone HTML)
        if (cfg.type === 'iframe') {
            current = gameId;
            loadIframe(cfg);
            return;
        }

        // Reaction Tap — module game with its own dataUrl + assetBase
        if (cfg.type === 'reaction-tap') {
            waitForModule('reaction-tap', function (mod) {
                if (!mod) {
                    stage.innerHTML = '<p style="padding:24px;color:#c0392b;">Reaction Tap module not loaded. Check console.</p>';
                    return;
                }
                current = gameId;
                stage.innerHTML = '';
                mod.mount(stage, { dataUrl: cfg.dataUrl, assetBase: cfg.assetBase });
            });
            return;
        }

        // Standard module games (memory, technique-match, hangman, belt-order)
        if (!cfg.cardFront) { cfg.cardFront = window.JJ_ARCADE_CONFIG.cardFront; }

        waitForModule(def.key, function (mod) {
            if (!mod) {
                stage.innerHTML = '<p style="padding:24px;color:#c0392b;">Module not loaded: ' + gameId + '. Check console.</p>';
                return;
            }
            current = gameId;
            if (cfg.dataUrl) {
                fetch(cfg.dataUrl + '?v=<?php echo $ver; ?>')
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        var merged = Object.assign({}, cfg, data);
                        merged.cardFront  = cfg.cardFront;   // preserve per-game cardFront
                        merged.imageBase  = cfg.imageBase;   // preserve imageBase for technique-match
                        stage.innerHTML = '';
                        mod.mount(stage, merged);
                    })
                    .catch(function (e) {
                        stage.innerHTML = '<p style="color:red;">Failed to load config: ' + e.message + '</p>';
                    });
            } else {
                stage.innerHTML = '';
                mod.mount(stage, cfg);
            }
        });
    }

    navBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            navBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            loadGame(btn.getAttribute('data-game'));
        });
    });

    // Boot — wait for memory module then load it
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