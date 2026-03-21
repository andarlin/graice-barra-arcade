<?php
/**
 * Template Name: Jiu-Jitsu Arcade
 * Description: JSON-driven mini-game hub for GBLC / Little Grapplers.
 */

defined('ABSPATH') || exit;

function jj_arcade_asset_url($path) {
  return get_stylesheet_directory_uri() . '/assets/jj-arcade/' . ltrim($path, '/');
}
function jj_arcade_asset_path($path) {
  return get_stylesheet_directory() . '/assets/jj-arcade/' . ltrim($path, '/');
}

add_action('wp_enqueue_scripts', function () {
  // CSS
  $css_path = jj_arcade_asset_path('jj-arcade.css');
  if (file_exists($css_path)) {
    wp_enqueue_style(
      'jj-arcade-css',
      jj_arcade_asset_url('jj-arcade.css'),
      [],
      filemtime($css_path)
    );
  }

  // Main loader
  $js_path = jj_arcade_asset_path('jj-arcade.js');
  if (file_exists($js_path)) {
    wp_enqueue_script(
      'jj-arcade-js',
      jj_arcade_asset_url('jj-arcade.js'),
      [],
      filemtime($js_path),
      true
    );
  }

  // Game modules (start with memory)
  $mem_path = jj_arcade_asset_path('games/memory.js');
  if (file_exists($mem_path)) {
    wp_enqueue_script(
      'jj-arcade-memory',
      jj_arcade_asset_url('games/memory.js'),
      ['jj-arcade-js'],
      filemtime($mem_path),
      true
    );
  }

  // Load JSON config (from theme for now)
  $json_path = jj_arcade_asset_path('data/jj-arcade.json');
  $config = [];

  if (file_exists($json_path)) {
    $raw = file_get_contents($json_path);
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
      $config = $decoded;
    }
  }

  // Only add inline config if the main loader is enqueued
  if (wp_script_is('jj-arcade-js', 'enqueued')) {
    wp_add_inline_script(
      'jj-arcade-js',
      'window.JJ_ARCADE_CONFIG = ' . wp_json_encode($config) . ';',
      'before'
    );
  }
}, 20);

get_header();
?>

<div class="jj-arcade-wrapper">
  <main class="jj-arcade">
    <section class="jj-arcade__header">
      <h1 id="jj-arcade-title"></h1>
      <p id="jj-arcade-subtitle"></p>
    </section>

    <section class="jj-arcade__layout">
      <aside class="jj-arcade__sidebar">
        <h2>Games</h2>
        <div id="jj-arcade-game-list" class="jj-arcade__game-list"></div>
      </aside>

      <section class="jj-arcade__stage">
        <div id="jj-arcade-stage"></div>
      </section>
    </section>
  </main>
</div>

<?php
get_footer();