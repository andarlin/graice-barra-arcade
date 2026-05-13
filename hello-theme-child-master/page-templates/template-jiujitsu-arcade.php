<?php
/**
 * Template Name: Jiu-Jitsu Arcade
 * @package hello-theme-child-master
 * Version: 2.9.0 — Netflix-style layout | cinematic hero + carousel
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$child_uri = get_stylesheet_directory_uri();
$ver       = '2.9.0';

/*
 * THUMBNAIL MAP
 * Upload the 7 .webp files to: /assets/jj-arcade/thumbnails/
 */
$thumbs = [
    'memory'          => $child_uri . '/assets/jj-arcade/thumbnails/memory_game_thumbnail.webp',
    'technique-match' => $child_uri . '/assets/jj-arcade/thumbnails/technique_match_thumbnail.webp',
    'hangman'         => $child_uri . '/assets/jj-arcade/thumbnails/jj_hangman_thumbnail.webp',
    'belt-order'      => $child_uri . '/assets/jj-arcade/thumbnails/belt_order_thumbnail.webp',
    'space-invaders'  => $child_uri . '/assets/jj-arcade/thumbnails/space_invaders_thumbnail.webp',
    'reaction-tap'    => $child_uri . '/assets/jj-arcade/thumbnails/reaction_tap_thumbnail.webp',
    'dojo-dash'       => $child_uri . '/assets/jj-arcade/thumbnails/dojo_dash_thumbnail.webp',
    'trivia'          => $child_uri . '/assets/jj-arcade/thumbnails/trivia_thumbnail.webp',
];
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:wght@300;400;500;600&family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?php echo $child_uri; ?>/assets/jj-arcade/jj-arcade.css?ver=<?php echo $ver; ?>">
    <link rel="stylesheet" href="<?php echo $child_uri; ?>/assets/jj-arcade/jj-memory-game.css?ver=<?php echo $ver; ?>">
    <link rel="stylesheet" href="<?php echo $child_uri; ?>/assets/jj-arcade/hangman.css?ver=<?php echo $ver; ?>">

    <style data-noptimize="1">
    /* ============================================================
       JJA PAGE CHROME v2.8 — Netflix-style
       Touches: hero, carousel, stage wrapper only.
       jj-arcade.css / jj-memory-game.css / hangman.css untouched.
       ============================================================ */
    :root {
        --gb-red:        #C8102E;
        --gb-red-dark:   #a00d24;
        --gb-red-pale:   #fdf0f2;
        --bg:            #ffffff;
        --bg-soft:       #f5f5f5;
        --border:        #e8e8e8;
        --border-mid:    #d0d0d0;
        --text-primary:  #111111;
        --text-secondary:#555555;
        --text-muted:    #999999;
        --dark:          #141414;
        --font-display:  'Barlow Condensed', sans-serif;
        --font-body:     'Barlow', sans-serif;
        --radius:        10px;
        --shadow:        0 2px 12px rgba(0,0,0,0.08);
        --shadow-lg:     0 8px 32px rgba(0,0,0,0.14);
    }

    body { margin: 0; background: var(--bg-soft); font-family: var(--font-body); }
    .jj-arcade-wrap { max-width: 100%; overflow-x: hidden; padding-bottom: 60px; }

    /* ── CINEMATIC HERO ── */
    .jja-hero {
        position: relative;
        width: 100%;
        height: 460px;
        background: var(--dark);
        overflow: hidden;
        display: flex;
        align-items: flex-end;
    }
    @media (max-width: 600px) { .jja-hero { height: 300px; } }

    .jja-hero__bg {
        position: absolute; inset: 0;
        background-size: cover;
        background-position: center 20%;
        background-repeat: no-repeat;
        transition: opacity 0.35s ease;
    }
    .jja-hero__scrim {
        position: absolute; inset: 0;
        background:
            linear-gradient(to right,  rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.05) 100%),
            linear-gradient(to top,    rgba(0,0,0,0.85) 0%, transparent 55%);
        pointer-events: none;
    }
    .jja-hero__content {
        position: relative; z-index: 2;
        padding: 0 40px 36px;
        max-width: 520px;
    }
    @media (max-width: 600px) { .jja-hero__content { padding: 0 20px 24px; } }

    .jja-hero__eyebrow {
        font-family: var(--font-display);
        font-size: 11px; font-weight: 700;
        letter-spacing: 0.22em; text-transform: uppercase;
        color: var(--gb-red); margin-bottom: 8px;
        display: flex; align-items: center; gap: 8px;
    }
    .jja-hero__eyebrow::before {
        content: ''; display: block;
        height: 1px; width: 20px;
        background: var(--gb-red); opacity: 0.6;
    }

    .jja-hero__tag {
        display: inline-block;
        font-family: var(--font-display);
        font-size: 10px; font-weight: 700;
        letter-spacing: 0.12em; text-transform: uppercase;
        color: white; background: var(--gb-red);
        padding: 3px 10px; border-radius: 3px; margin-bottom: 10px;
    }

    .jja-hero__title {
        font-family: var(--font-display) !important;
        font-size: clamp(30px, 5.5vw, 50px) !important;
        font-weight: 900 !important; line-height: 1 !important;
        letter-spacing: -0.01em !important; text-transform: uppercase !important;
        color: #ffffff !important; margin: 0 0 10px !important;
        text-shadow: 0 2px 12px rgba(0,0,0,0.5);
    }
    .jja-hero__desc {
        font-size: 14px; font-weight: 400;
        color: rgba(255,255,255,0.8); line-height: 1.55;
        margin: 0 0 22px; max-width: 360px;
        text-shadow: 0 1px 4px rgba(0,0,0,0.6);
    }
    .jja-hero__actions { display: flex; gap: 10px; flex-wrap: wrap; }

    .jja-btn-play {
        display: inline-flex; align-items: center; gap: 8px;
        background: var(--gb-red); color: white;
        font-family: var(--font-display);
        font-size: 15px; font-weight: 800;
        letter-spacing: 0.06em; text-transform: uppercase;
        border: none; padding: 12px 26px; border-radius: 6px;
        cursor: pointer; transition: background 0.2s, transform 0.15s;
    }
    .jja-btn-play:hover { background: var(--gb-red-dark); transform: scale(1.03); }

    /* ── GAME STAGE WRAPPER ── */
    .jja-stage-wrap { display: none; background: var(--bg); border-bottom: 1px solid var(--border); }
    .jja-stage-wrap.is-visible { display: block; }

    .jja-now-playing {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 20px;
        background: var(--dark); border-bottom: 2px solid var(--gb-red);
    }
    .jja-now-playing__left { display: flex; align-items: center; gap: 10px; }

    .jja-now-playing__dot {
        width: 8px; height: 8px;
        background: var(--gb-red); border-radius: 50%;
        animation: jjaPulse 1.4s ease-in-out infinite;
    }
    @keyframes jjaPulse {
        0%,100% { opacity:1; transform:scale(1); }
        50%      { opacity:0.4; transform:scale(0.65); }
    }
    .jja-now-playing__label {
        font-family: var(--font-display); font-size: 11px; font-weight: 700;
        letter-spacing: 0.18em; text-transform: uppercase;
        color: rgba(255,255,255,0.55);
    }
    .jja-now-playing__name {
        font-family: var(--font-display); font-size: 15px; font-weight: 800;
        letter-spacing: 0.06em; text-transform: uppercase; color: #fff;
    }
    .jja-btn-close-game {
        background: transparent; border: 1px solid rgba(255,255,255,0.2);
        color: rgba(255,255,255,0.6);
        font-family: var(--font-display); font-size: 11px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        padding: 6px 14px; border-radius: 4px; cursor: pointer;
        transition: border-color 0.15s, color 0.15s;
    }
    .jja-btn-close-game:hover { border-color: var(--gb-red); color: #fff; }

    /* The actual mount target — id="jj-arcade-stage" preserved */
    .jj-arcade__stage {
        background: var(--bg); padding: 28px 24px;
        min-height: 400px; max-width: 1000px; margin: 0 auto;
    }
    @media (max-width: 600px) {
        .jj-arcade__stage { padding: 12px 8px; }
        .jj-space-invaders-wrap iframe,
        .jj-iframe-wrap iframe { height: 85vh; min-height: 500px; }
    }

    /* ── STATS BAR ── */
    .jja-stats {
        display: grid; grid-template-columns: repeat(4,1fr);
        background: var(--bg);
        border-top: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
    }
    .jja-stat { padding: 14px 8px; text-align: center; }
    .jja-stat + .jja-stat { border-left: 1px solid var(--border); }
    .jja-stat__num {
        font-family: var(--font-display); font-size: 24px; font-weight: 800;
        color: var(--text-primary); line-height: 1; margin-bottom: 3px;
    }
    .jja-stat__lbl {
        font-size: 9px; font-weight: 700; letter-spacing: 0.16em;
        text-transform: uppercase; color: var(--text-muted);
    }
    @media (max-width: 480px) {
        .jja-stats { grid-template-columns: repeat(2,1fr); }
        .jja-stat:nth-child(3) { border-left:none; border-top:1px solid var(--border); }
        .jja-stat:nth-child(4) { border-top:1px solid var(--border); }
    }

    /* ── CAROUSEL SECTION ── */
    .jja-carousel-section {
        background: var(--bg);
        padding: 24px 0 28px;
        border-bottom: 1px solid var(--border);
    }
    .jja-carousel-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 20px; margin-bottom: 14px;
    }
    .jja-carousel-title {
        font-family: var(--font-display); font-size: 12px; font-weight: 700;
        letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted);
    }
    .jja-carousel-count {
        font-family: var(--font-display); font-size: 11px; font-weight: 600;
        color: var(--text-muted); letter-spacing: 0.05em;
    }

    /* Scrollable track */
    .jja-carousel-track {
        display: flex; gap: 12px;
        overflow-x: auto;
        padding: 4px 20px 10px;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
    }
    .jja-carousel-track::-webkit-scrollbar { display: none; }

    /* ── Individual carousel card ──
       Class + data-game attributes preserved for router.
       All old pill CSS overridden here.                    */
    .jja-carousel-track .jj-arcade__nav-btn {
        display: flex !important; flex-direction: column !important;
        align-items: flex-start !important; gap: 0 !important;
        flex-shrink: 0; width: 188px;
        background: var(--bg) !important;
        border: 1px solid var(--border) !important;
        border-radius: var(--radius) !important;
        padding: 0 !important; overflow: hidden;
        cursor: pointer; scroll-snap-align: start;
        transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        white-space: normal !important;
        font-weight: inherit !important; font-size: inherit !important;
        color: inherit !important; text-align: left !important;
    }
    .jja-carousel-track .jj-arcade__nav-btn:hover {
        border-color: var(--gb-red) !important;
        transform: translateY(-3px) scale(1.02);
        box-shadow: var(--shadow-lg) !important;
        background: var(--bg) !important; color: inherit !important;
    }
    .jja-carousel-track .jj-arcade__nav-btn.active {
        border-color: var(--gb-red) !important; border-width: 2px !important;
        box-shadow: 0 0 0 3px rgba(200,16,46,0.1) !important;
        background: var(--bg) !important; color: inherit !important;
    }

    .jja-card-thumb {
        width: 100%; height: 106px;
        object-fit: cover; object-position: center 20%;
        display: block; pointer-events: none;
        background: var(--dark);
    }
    .jja-card-body {
        padding: 10px 12px 12px;
        border-top: 1px solid var(--border);
        width: 100%; box-sizing: border-box; pointer-events: none;
    }
    .jja-card-name {
        font-family: var(--font-display); font-size: 13px; font-weight: 800;
        letter-spacing: 0.04em; text-transform: uppercase;
        color: var(--text-primary); display: block; margin-bottom: 4px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .jja-card-desc {
        font-size: 11px; font-weight: 400; color: var(--text-secondary);
        line-height: 1.4; margin-bottom: 7px;
        display: -webkit-box; -webkit-line-clamp: 2;
        -webkit-box-orient: vertical; overflow: hidden;
    }
    .jja-card-tag {
        display: inline-block; font-size: 9px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        color: var(--gb-red); background: var(--gb-red-pale);
        border: 1px solid rgba(200,16,46,0.15);
        padding: 2px 6px; border-radius: 3px;
    }

    /* ── COMING SOON ── */
    .jja-locked-section { background: var(--bg-soft); padding: 20px 0 28px; }
    .jja-locked-header {
        padding: 0 20px; margin-bottom: 12px;
        font-family: var(--font-display); font-size: 11px; font-weight: 700;
        letter-spacing: 0.2em; text-transform: uppercase; color: var(--text-muted);
    }
    .jja-locked-list { display: flex; flex-direction: column; gap: 8px; padding: 0 20px; max-width: 680px; }

    .jj-arcade__nav-btn--locked {
        display: flex !important; flex-direction: row !important;
        align-items: center !important; justify-content: space-between !important;
        gap: 12px !important;
        background: var(--bg) !important; border: 1px solid var(--border) !important;
        border-radius: var(--radius) !important; padding: 13px 16px !important;
        opacity: 0.55; cursor: pointer; transition: opacity 0.15s;
        white-space: normal !important; font-weight: inherit; font-size: inherit;
        color: inherit; width: 100%; box-sizing: border-box;
    }
    .jj-arcade__nav-btn--locked:hover {
        opacity: 0.75; background: var(--bg) !important;
        border-color: var(--border-mid) !important; color: inherit !important;
    }
    .locked-left { display: flex; align-items: center; gap: 12px; }
    .lock-icon { font-size: 15px !important; opacity: 0.4; }
    .locked-name {
        font-family: var(--font-display); font-size: 15px; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary);
    }
    .locked-pill {
        font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
        color: var(--text-muted); border: 1px solid var(--border-mid);
        padding: 3px 9px; border-radius: 20px; white-space: nowrap;
    }

    /* ── IFRAME + TEASER (preserved from v2.6) ── */
    .jj-iframe-wrap { display:flex; flex-direction:column; align-items:center; gap:12px; }
    .jj-iframe-wrap iframe { width:100%; max-width:960px; height:640px; border:none; border-radius:8px; background:#000; display:block; }
    .jj-iframe-hint { font-size:.78rem; color:#888; text-align:center; }
    .jj-space-invaders-wrap { display:flex; flex-direction:column; align-items:center; gap:12px; }
    .jj-space-invaders-wrap iframe { width:100%; max-width:800px; height:640px; border:none; border-radius:8px; background:#000; display:block; }
    .jj-space-invaders-hint { font-size:.78rem; color:#888; text-align:center; }

    .jj-teaser { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:340px; text-align:center; padding:32px 24px; }
    .jj-teaser__icon { font-size:3.5rem; margin-bottom:16px; opacity:.75; }
    .jj-teaser__badge { display:inline-block; background:#fff3cd; color:#856404; border:1px solid #ffc107; border-radius:999px; font-size:.72rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:3px 12px; margin-bottom:14px; }
    .jj-teaser__title { font-size:1.6rem; font-weight:800; color:#222; margin:0 0 10px; }
    .jj-teaser__desc  { font-size:.95rem; color:#666; max-width:420px; line-height:1.6; margin:0 auto 24px; }
    .jj-teaser__lock  { font-size:.82rem; color:#aaa; margin-top:8px; }
    .jj-teaser__lock span { font-size:1rem; }

    /* ── ANIMATIONS ── */
    @keyframes jjaFadeUp {
        from { opacity:0; transform:translateY(10px); }
        to   { opacity:1; transform:translateY(0); }
    }
    .jja-hero             { animation: jjaFadeUp .5s ease both; }
    .jja-stats            { animation: jjaFadeUp .5s .06s ease both; }
    .jja-carousel-section { animation: jjaFadeUp .5s .12s ease both; }
    </style>
</head>
<body <?php body_class('jj-arcade-page'); ?>>
<?php
if ( ! ( function_exists('elementor_theme_do_location') && elementor_theme_do_location('header') ) ) {
    get_template_part('template-parts/header/header', 'one');
}
?>

<div class="jj-arcade-wrap" id="jj-arcade-wrap">

    <!-- CINEMATIC HERO -->
    <div class="jja-hero" id="jja-hero">
        <div class="jja-hero__bg" id="jja-hero-bg"
             style="background-image:url('<?php echo esc_url($thumbs['memory']); ?>');">
        </div>
        <div class="jja-hero__scrim"></div>
        <div class="jja-hero__content">
            <div class="jja-hero__eyebrow">Gracie Barra Lake Country</div>
            <div class="jja-hero__tag" id="jja-hero-tag">Memory</div>
            <h1 class="jja-hero__title" id="jja-hero-title">Memory Game</h1>
            <p class="jja-hero__desc" id="jja-hero-desc">Flip and match GB technique cards. Beat your best time.</p>
            <div class="jja-hero__actions">
                <button class="jja-btn-play" id="jja-btn-play">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                        <path d="M2 1.5l10 5.5-10 5.5V1.5z"/>
                    </svg>
                    Play Now
                </button>
            </div>
        </div>
    </div>

    <!-- GAME STAGE (hidden until Play clicked) -->
    <div class="jja-stage-wrap" id="jja-stage-wrap">
        <div class="jja-now-playing">
            <div class="jja-now-playing__left">
                <div class="jja-now-playing__dot"></div>
                <div class="jja-now-playing__label">Now&nbsp;Playing</div>
                <div class="jja-now-playing__name" id="jja-playing-name">Memory Game</div>
            </div>
            <button class="jja-btn-close-game" id="jja-btn-close">✕ Back</button>
        </div>
        <!-- id="jj-arcade-stage" preserved exactly for router -->
        <div class="jj-arcade__stage" id="jj-arcade-stage"></div>
    </div>

    <!-- STATS BAR -->
    <div class="jja-stats">
        <div class="jja-stat__num">8</div><div class="jja-stat__lbl">Games</div>
        <div class="jja-stat"><div class="jja-stat__num">5</div><div class="jja-stat__lbl">Levels</div></div>
        <div class="jja-stat"><div class="jja-stat__num">4.5★</div><div class="jja-stat__lbl">Rating</div></div>
        <div class="jja-stat"><div class="jja-stat__num">Free</div><div class="jja-stat__lbl">To Play</div></div>
    </div>

    <!-- CAROUSEL -->
    <div class="jja-carousel-section">
        <div class="jja-carousel-header">
            <span class="jja-carousel-title">All Games</span>
            <span class="jja-carousel-count">8 Available</span>
        </div>

        <!-- id="jj-arcade-nav" + class/data-game preserved for router -->
        <nav class="jja-carousel-track" id="jj-arcade-nav">

            <button class="jj-arcade__nav-btn active" data-game="memory">
                <img class="jja-card-thumb" src="<?php echo esc_url($thumbs['memory']); ?>" alt="Memory Game" loading="lazy">
                <div class="jja-card-body">
                    <span class="jja-card-name">Memory Game</span>
                    <span class="jja-card-desc">Flip and match GB technique cards. Beat your best time.</span>
                    <span class="jja-card-tag">Memory</span>
                </div>
            </button>

            <button class="jj-arcade__nav-btn" data-game="technique-match">
                <img class="jja-card-thumb" src="<?php echo esc_url($thumbs['technique-match']); ?>" alt="Technique Match" loading="lazy">
                <div class="jja-card-body">
                    <span class="jja-card-name">Technique Match</span>
                    <span class="jja-card-desc">Match the move name to the right position card.</span>
                    <span class="jja-card-tag">Knowledge</span>
                </div>
            </button>

            <button class="jj-arcade__nav-btn" data-game="hangman">
                <img class="jja-card-thumb" src="<?php echo esc_url($thumbs['hangman']); ?>" alt="JJ Hangman" loading="lazy">
                <div class="jja-card-body">
                    <span class="jja-card-name">JJ Hangman</span>
                    <span class="jja-card-desc">Guess the BJJ term before you run out of tries.</span>
                    <span class="jja-card-tag">Vocabulary</span>
                </div>
            </button>

            <button class="jj-arcade__nav-btn" data-game="belt-order">
                <img class="jja-card-thumb" src="<?php echo esc_url($thumbs['belt-order']); ?>" alt="Belt Order" loading="lazy">
                <div class="jja-card-body">
                    <span class="jja-card-name">Belt Order</span>
                    <span class="jja-card-desc">Drag the belts into the correct rank order.</span>
                    <span class="jja-card-tag">Ranking</span>
                </div>
            </button>

            <button class="jj-arcade__nav-btn" data-game="space-invaders">
                <img class="jja-card-thumb" src="<?php echo esc_url($thumbs['space-invaders']); ?>" alt="Space Invaders" loading="lazy">
                <div class="jja-card-body">
                    <span class="jja-card-name">Space Invaders</span>
                    <span class="jja-card-desc">Defend the mat — shoot down the invaders!</span>
                    <span class="jja-card-tag">Arcade</span>
                </div>
            </button>

            <button class="jj-arcade__nav-btn" data-game="reaction-tap">
                <img class="jja-card-thumb" src="<?php echo esc_url($thumbs['reaction-tap']); ?>" alt="Reaction Tap" loading="lazy">
                <div class="jja-card-body">
                    <span class="jja-card-name">Reaction Tap</span>
                    <span class="jja-card-desc">Tap the right student photo before time runs out.</span>
                    <span class="jja-card-tag">Reflex</span>
                </div>
            </button>

            <button class="jj-arcade__nav-btn" data-game="dojo-dash">
                <img class="jja-card-thumb" src="<?php echo esc_url($thumbs['dojo-dash']); ?>" alt="Dojo Dash" loading="lazy">
                <div class="jja-card-body">
                    <span class="jja-card-name">Dojo Dash</span>
                    <span class="jja-card-desc">Run through the dojo, collect GB badges, avoid rivals.</span>
                    <span class="jja-card-tag">Action</span>
                </div>
            </button>
            <button class="jj-arcade__nav-btn" data-game="trivia">
                <img class="jja-card-thumb" src="<?php echo esc_url($thumbs['trivia']); ?>" alt="GB Trivia Quiz" loading="lazy"
                     onerror="this.style.background='#12395d';this.removeAttribute('onerror');">
                <div class="jja-card-body">
                    <span class="jja-card-name">GB Trivia Quiz</span>
                    <span class="jja-card-desc">Coach Trenell quizzes you on GB culture, belts, and BJJ.</span>
                    <span class="jja-card-tag">Trivia</span>
                </div>
            </button>


        </nav>
    </div>

    <!-- COMING SOON -->
    <div class="jja-locked-section">
        <div class="jja-locked-header">Coming Soon</div>
        <div class="jja-locked-list">
          
            <button class="jj-arcade__nav-btn--locked" data-teaser="position-builder">
                <div class="locked-left"><span class="lock-icon">&#128274;</span><span class="locked-name">Position Builder</span></div>
                <span class="locked-pill">In Development</span>
            </button>

            <button class="jj-arcade__nav-btn--locked" data-teaser="scenario">
                <div class="locked-left"><span class="lock-icon">&#128274;</span><span class="locked-name">Scenario Engine</span></div>
                <span class="locked-pill">Coming Later</span>
            </button>

        </div>
    </div>

</div><!-- /.jj-arcade-wrap -->

<?php
if ( ! ( function_exists('elementor_theme_do_location') && elementor_theme_do_location('footer') ) ) {
    get_template_part('template-parts/footer/footer', 'one');
}
wp_footer();
?>

<!-- Game Scripts — untouched from v2.6.0 -->
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/memory.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/technique-match.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/hangman.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/belt-order.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/reaction-tap.js?ver=<?php echo $ver; ?>"></script>
<script src="<?php echo $child_uri; ?>/assets/jj-arcade/games/bjj-trivia.js?ver=<?php echo $ver; ?>"></script>

<script data-noptimize="1">
var CHILD_URI = '<?php echo $child_uri; ?>';

/* Thumbnail + description metadata for hero swaps */
var JJA_GAME_META = {
    'memory':          { name:'Memory Game',     tag:'Memory',    desc:'Flip and match GB technique cards. Beat your best time.',    thumb:CHILD_URI+'/assets/jj-arcade/thumbnails/memory_game_thumbnail.webp' },
    'technique-match': { name:'Technique Match', tag:'Knowledge', desc:'Match the move name to the right position card.',            thumb:CHILD_URI+'/assets/jj-arcade/thumbnails/technique_match_thumbnail.webp' },
    'hangman':         { name:'JJ Hangman',      tag:'Vocabulary',desc:'Guess the BJJ term before you run out of tries.',            thumb:CHILD_URI+'/assets/jj-arcade/thumbnails/jj_hangman_thumbnail.webp' },
    'belt-order':      { name:'Belt Order',      tag:'Ranking',   desc:'Drag the belts into the correct rank order.',                thumb:CHILD_URI+'/assets/jj-arcade/thumbnails/belt_order_thumbnail.webp' },
    'space-invaders':  { name:'Space Invaders',  tag:'Arcade',    desc:'Defend the mat — shoot down the invaders!',                  thumb:CHILD_URI+'/assets/jj-arcade/thumbnails/space_invaders_thumbnail.webp' },
    'reaction-tap':    { name:'Reaction Tap',    tag:'Reflex',    desc:'Tap the right student photo before time runs out.',          thumb:CHILD_URI+'/assets/jj-arcade/thumbnails/reaction_tap_thumbnail.webp' },
    'dojo-dash':       { name:'Dojo Dash',       tag:'Action',    desc:'Run through the dojo, collect GB badges, avoid rivals.',    thumb:CHILD_URI+'/assets/jj-arcade/thumbnails/dojo_dash_thumbnail.webp' },
    'trivia':          { name:'GB Trivia Quiz',  tag:'Trivia',    desc:'Coach Trenell quizzes you on GB culture, belts, and BJJ.', thumb:CHILD_URI+'/assets/jj-arcade/thumbnails/trivia_thumbnail.webp' }
};

/* Arcade config — zero changes from v2.6.0 */
window.JJ_ARCADE_CONFIG = {
    cardFront: CHILD_URI + '/assets/jj-arcade/cards/jj-card-junior-1.png',
    games: [
        {
            id:'memory', type:'memory', title:'GB Junior 1 Memory Game', pairs:6,
            cards:[
                {id:'junior_1',label:'Junior Champ 1',image:CHILD_URI+'/assets/jj-arcade/cards/Junior_Champ_1.png'},
                {id:'junior_2',label:'Junior Champ 2',image:CHILD_URI+'/assets/jj-arcade/cards/Junior_Champ_2.png'},
                {id:'junior_3',label:'Junior Champ 3',image:CHILD_URI+'/assets/jj-arcade/cards/Junior_Champ_3.png'},
                {id:'junior_4',label:'Junior Champ 4',image:CHILD_URI+'/assets/jj-arcade/cards/Junior_Champ_4.png'},
                {id:'little_1',label:'Little Champ 1',image:CHILD_URI+'/assets/jj-arcade/cards/Little_Champ_1.png'},
                {id:'little_2',label:'Little Champ 2',image:CHILD_URI+'/assets/jj-arcade/cards/Little_Champ_2.png'}
            ],
            questions:[
                {q:'What is one thing you do to be a great training partner?',choices:['Be safe','Be respectful','Help others learn']},
                {q:'What position do you feel most confident in right now?',choices:['Closed guard','Mount','Side control']},
                {q:'What is one goal you want to achieve this month?',choices:['Train more','Learn a new move','Get stronger']},
                {q:'What is your favorite warm-up drill?',choices:['Shrimping','Bear crawls','Forward rolls']},
                {q:'If you could improve one skill instantly, what would it be?',choices:['Escapes','Guard retention','Takedowns']}
            ]
        },
        {
            id:'technique-match',type:'technique-match',title:'Technique Match',pairs:6,
            cardFront:CHILD_URI+'/assets/jj-arcade/cards/jj-card-technique-match.png',
            dataUrl:CHILD_URI+'/assets/jj-arcade/data/technique-match.json',
            imageBase:CHILD_URI+'/assets/jj-arcade/cards'
        },
        {id:'hangman',   type:'hangman',   title:'JJ Hangman'},
        {id:'belt-order',type:'belt-order',title:'Belt Order'},
        {id:'space-invaders',type:'iframe',title:'Space Invaders',src:CHILD_URI+'/assets/jj-arcade/games/space-invaders-jj.html'},
        {id:'reaction-tap',type:'reaction-tap',title:'Reaction Tap',dataUrl:CHILD_URI+'/assets/jj-arcade/data/reaction-tap.json',assetBase:CHILD_URI+'/assets/jj-arcade/cards'},
        {id:'dojo-dash',type:'iframe',title:'Dojo Dash',src:CHILD_URI+'/assets/jj-arcade/games/dojo-dash.html',hint:'Arrow keys or WASD to move &nbsp;|&nbsp; Collect GB badges &nbsp;|&nbsp; Avoid rivals &nbsp;|&nbsp; P to pause'},
        {id:'trivia',type:'trivia',title:'GB Trivia Quiz'}
    ]
};

var JJ_TEASERS = {
    'position-builder': {icon:'&#128506;&#65039;',title:'Position Builder',desc:'Arrange techniques in sequence and build your attack chain.'},
    'scenario':         {icon:'&#127919;',title:'Scenario Engine',    desc:'Your opponent moves — what do you do? Make split-second decisions and see where your choices lead.'}
};
/* ── HERO CONTROLLER (v2.8) ── */
(function(){
    var hero      = document.getElementById('jja-hero');
    var heroBg    = document.getElementById('jja-hero-bg');
    var heroTitle = document.getElementById('jja-hero-title');
    var heroDesc  = document.getElementById('jja-hero-desc');
    var heroTag   = document.getElementById('jja-hero-tag');
    var stageWrap = document.getElementById('jja-stage-wrap');
    var nameEl    = document.getElementById('jja-playing-name');
    var btnPlay   = document.getElementById('jja-btn-play');
    var btnClose  = document.getElementById('jja-btn-close');
    var activeId  = 'memory';

    function updateHero(id){
        var m = JJA_GAME_META[id]; if(!m) return;
        activeId = id;
        heroBg.style.opacity='0';
        setTimeout(function(){ heroBg.style.backgroundImage='url("'+m.thumb+'")'; heroBg.style.opacity='1'; },220);
        heroTitle.textContent = m.name;
        heroDesc.textContent  = m.desc;
        heroTag.textContent   = m.tag;
    }

    function openStage(id){
        var m = JJA_GAME_META[id]||{};
        if(nameEl) nameEl.textContent = m.name||id;
        hero.style.display='none';
        stageWrap.classList.add('is-visible');
        stageWrap.scrollIntoView({behavior:'smooth',block:'start'});
    }

    btnPlay.addEventListener('click',function(){
        openStage(activeId);
        /* Kick the router by re-clicking the active card */
        var activeBtn = document.querySelector('.jja-carousel-track .jj-arcade__nav-btn.active');
        if(activeBtn) activeBtn.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    });

    btnClose.addEventListener('click',function(){
        stageWrap.classList.remove('is-visible');
        document.getElementById('jj-arcade-stage').innerHTML='';
        hero.style.display='';
        hero.scrollIntoView({behavior:'smooth',block:'start'});
    });

    window.JJA_HERO = { updateHero:updateHero, openStage:openStage };
})();

/* ── ARCADE ROUTER — same as v2.6.0, hero hooks added ── */
(function(){
    var stage    = document.getElementById('jj-arcade-stage');
    var liveBtns = document.querySelectorAll('.jj-arcade__nav-btn');
    var lockBtns = document.querySelectorAll('.jj-arcade__nav-btn--locked');

    function getGameModule(game){
        if(!game) return null;
        var w=window.JJGames||{};
        var keys=[game.mountKey,game.type,game.id,String(game.type||'').replace(/-/g,''),String(game.id||'').replace(/-/g,'')].filter(Boolean);
        for(var i=0;i<keys.length;i++){if(w[keys[i]]&&typeof w[keys[i]].mount==='function')return w[keys[i]];}
        var slug=String(game.id||game.type||'').toLowerCase();
        if(slug.indexOf('technique')!==-1||slug.indexOf('match')!==-1) return w.techniqueMatch||w['technique-match']||w.techniquematch||null;
        if(slug.indexOf('hangman')!==-1) return w.hangman||w.JJHangman||null;
        if(slug.indexOf('belt')!==-1)    return w.beltOrder||w['belt-order']||w.beltorder||null;
        if(slug.indexOf('memory')!==-1)  return w.memory||w.memoryGame||w['memory-game']||null;
        if(slug.indexOf('trivia')!==-1)  return w.trivia||w['trivia']||null;
        return null;
    }

    function waitForModule(game,ms){
        ms=ms||6000; var t0=Date.now();
        return new Promise(function(res){
            (function tick(){var m=getGameModule(game);if(m)return res(m);if(Date.now()-t0>ms)return res(null);setTimeout(tick,100);})();
        });
    }

    function loadIframe(cfg){
        stage.innerHTML='';
        var wrap=document.createElement('div'); wrap.className='jj-iframe-wrap';
        var iframe=document.createElement('iframe');
        iframe.src=cfg.src; iframe.title=cfg.title||'Arcade Game';
        iframe.allowFullscreen=true; iframe.setAttribute('allow','autoplay');
        var hint=document.createElement('p'); hint.className='jj-iframe-hint'; hint.innerHTML=cfg.hint||'';
        wrap.appendChild(iframe); if(cfg.hint)wrap.appendChild(hint);
        stage.appendChild(wrap);
    }

    function loadTeaser(id){
        var t=JJ_TEASERS[id];
        if(!t){stage.innerHTML='<p style="padding:24px;color:#999;">Coming soon!</p>';return;}
        stage.innerHTML='<div class="jj-teaser"><div class="jj-teaser__icon">'+t.icon+'</div><div class="jj-teaser__badge">Coming Soon</div><h2 class="jj-teaser__title">'+esc(t.title)+'</h2><p class="jj-teaser__desc">'+esc(t.desc)+'</p><p class="jj-teaser__lock"><span>&#128274;</span> Available in a future update</p></div>';
    }

    function loadGame(id){
        stage.innerHTML='<p style="text-align:center;padding:40px;color:#999;">Loading…</p>';
        var cfg=null, games=(window.JJ_ARCADE_CONFIG||{}).games||[];
        for(var i=0;i<games.length;i++){if(games[i].id===id){cfg=games[i];break;}}
        cfg=cfg||{id:id};

        if(cfg.type==='iframe'){loadIframe(cfg);return;}

        if(cfg.type==='reaction-tap'){
            waitForModule(cfg).then(function(mod){
                if(!mod){stage.innerHTML='<p style="padding:24px;color:#c0392b;">Reaction Tap module not loaded.</p>';return;}
                stage.innerHTML=''; mod.mount(stage,{dataUrl:cfg.dataUrl,assetBase:cfg.assetBase});
            });return;
        }

        if(!cfg.cardFront){cfg.cardFront=(window.JJ_ARCADE_CONFIG||{}).cardFront;}
        waitForModule(cfg).then(function(mod){
            if(!mod){stage.innerHTML='<p style="padding:24px;color:#c0392b;">Module not loaded: '+esc(id)+'</p>';return;}
            if(cfg.dataUrl){
                fetch(cfg.dataUrl+'?v=<?php echo $ver; ?>')
                    .then(function(r){return r.json();})
                    .then(function(data){
                        var m=Object.assign({},cfg,data); m.cardFront=cfg.cardFront; m.imageBase=cfg.imageBase;
                        stage.innerHTML=''; mod.mount(stage,m);
                    })
                    .catch(function(e){stage.innerHTML='<p style="color:red;padding:24px;">Config load failed: '+esc(e.message)+'</p>';});
            } else { stage.innerHTML=''; mod.mount(stage,cfg); }
        });
    }

    function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
    function clearActive(){liveBtns.forEach(function(b){b.classList.remove('active');});}

    /* Card click */
    liveBtns.forEach(function(btn){
        btn.addEventListener('click',function(){
            var id=btn.getAttribute('data-game');
            var sw=document.getElementById('jja-stage-wrap');

            if(sw&&sw.classList.contains('is-visible')){
                /* Stage open — switch game immediately */
                clearActive(); btn.classList.add('active');
                var ne=document.getElementById('jja-playing-name');
                if(ne)ne.textContent=(JJA_GAME_META[id]||{}).name||id;
                loadGame(id);
                sw.scrollIntoView({behavior:'smooth',block:'start'});
            } else {
                /* Stage hidden — update hero preview only */
                clearActive(); btn.classList.add('active');
                if(window.JJA_HERO) window.JJA_HERO.updateHero(id);
            }
        });
    });

    /* Locked click */
    lockBtns.forEach(function(btn){
        btn.addEventListener('click',function(){
            clearActive();
            var sw=document.getElementById('jja-stage-wrap');
            var he=document.getElementById('jja-hero');
            var ne=document.getElementById('jja-playing-name');
            if(ne)ne.textContent='Coming Soon';
            if(he)he.style.display='none';
            if(sw)sw.classList.add('is-visible');
            loadTeaser(btn.getAttribute('data-teaser'));
            if(sw)sw.scrollIntoView({behavior:'smooth',block:'start'});
        });
    });

    /* Boot — no auto-load; game loads only on Play click */

})();
</script>
</body>
</html>