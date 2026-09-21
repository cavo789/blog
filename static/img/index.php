<?php
declare(strict_types=1);

// ── Security ──────────────────────────────────────────────────────────────────
// GALLERY_ROOT is resolved once at init via realpath() — symlinks and ".." are
// fully collapsed. Every request must produce a path that starts with this value.

define('GALLERY_ROOT', realpath(__DIR__));   // e.g. /var/www/html/img
define('GALLERY_URL',  '/img');              // public URL prefix, no trailing slash

const IMAGE_EXT = ['avif', 'gif', 'ico', 'jpg', 'jpeg', 'png', 'svg', 'webp'];

function resolveDir(string $param): string {
    if ($param === '') {
        return GALLERY_ROOT;
    }
    // Null bytes make realpath() throw ValueError in PHP 8 — strip them first.
    $param = str_replace("\0", '', $param);
    if ($param === '') {
        return GALLERY_ROOT;
    }
    // realpath() resolves "..", symlinks, and encoded sequences in one call.
    $real = realpath(GALLERY_ROOT . DIRECTORY_SEPARATOR . ltrim($param, '/\\'));
    if ($real === false || !is_dir($real)) {
        return GALLERY_ROOT;
    }
    // Must be GALLERY_ROOT itself or a strict descendant — never a sibling.
    if ($real !== GALLERY_ROOT && !str_starts_with($real, GALLERY_ROOT . DIRECTORY_SEPARATOR)) {
        return GALLERY_ROOT;
    }
    return $real;
}

function publicUrl(string $abs): string {
    return GALLERY_URL . str_replace(DIRECTORY_SEPARATOR, '/', substr($abs, strlen(GALLERY_ROOT)));
}

function relPath(string $abs): string {
    return ltrim(str_replace(DIRECTORY_SEPARATOR, '/', substr($abs, strlen(GALLERY_ROOT))), '/');
}

function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

// ── Directory contents ────────────────────────────────────────────────────────

$currentDir = resolveDir($_GET['dir'] ?? '');
$currentRel = relPath($currentDir);

$subdirs = [];
$files   = [];

foreach (scandir($currentDir, SCANDIR_SORT_ASCENDING) ?: [] as $entry) {
    if ($entry === '.' || $entry === '..') {
        continue;
    }
    $full = $currentDir . DIRECTORY_SEPARATOR . $entry;
    if (is_dir($full)) {
        $subdirs[] = $entry;
    } elseif (in_array(strtolower(pathinfo($entry, PATHINFO_EXTENSION)), IMAGE_EXT, true)) {
        $files[] = $entry;
    }
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

$crumbs = [['label' => 'img', 'url' => '?dir=']];
if ($currentRel !== '') {
    $acc = '';
    foreach (explode('/', $currentRel) as $part) {
        $acc     .= ($acc === '' ? '' : '/') . $part;
        $crumbs[] = ['label' => $part, 'url' => '?dir=' . urlencode($acc)];
    }
}

$pageTitle = $currentRel !== '' ? basename($currentDir) . ' — Galerie' : 'Galerie d\'images';
?>
<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= h($pageTitle) ?></title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary:       #2e8555;
      --primary-dark:  #25783d;
      --bg:            #ffffff;
      --bg-2:          #f8f9fa;
      --bg-3:          #eef0f1;
      --border:        #dadde1;
      --text:          #1c1e21;
      --muted:         #606770;
      --danger:        #e03131;
      --shadow-sm:     0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06);
      --shadow-md:     0 4px 12px rgba(0,0,0,.1);
      --shadow-lg:     0 20px 40px rgba(0,0,0,.18);
      --radius:        8px;
      --font:          'Source Sans 3', system-ui, -apple-system, sans-serif;
      --font-heading:  'Bricolage Grotesque', 'Source Sans 3', system-ui, sans-serif;
      --font-mono:     'JetBrains Mono', 'Courier New', monospace;
    }

    [data-theme='dark'] {
      --bg:        #1b1b1d;
      --bg-2:      #242526;
      --bg-3:      #2d2d30;
      --border:    #444950;
      --text:      #e3e3e3;
      --muted:     #9da5b4;
      --shadow-sm: 0 1px 3px rgba(0,0,0,.3);
      --shadow-md: 0 4px 12px rgba(0,0,0,.4);
      --shadow-lg: 0 20px 40px rgba(0,0,0,.6);
    }

    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: var(--font);
      font-size: 15px;
      background: var(--bg);
      color: var(--text);
      min-height: 100dvh;
    }

    /* ── Toolbar ── */
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      height: 56px;
      background: var(--bg-2);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }

    .toolbar__logo {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 600;
      color: var(--primary);
      text-decoration: none;
      white-space: nowrap;
    }

    .toolbar__sep { flex: 1; }

    .toolbar__search {
      width: min(280px, 100%);
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      font-size: 14px;
      outline: none;
      transition: border-color 150ms, box-shadow 150ms;
    }

    .toolbar__search:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(46,133,85,.2);
    }

    .toolbar__search::placeholder { color: var(--muted); }

    .toolbar__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg);
      color: var(--muted);
      cursor: pointer;
      transition: color 150ms, border-color 150ms;
    }

    .toolbar__btn:hover { color: var(--primary); border-color: var(--primary); }
    .toolbar__btn svg { width: 18px; height: 18px; pointer-events: none; }

    /* ── Page content ── */
    .content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px 20px 48px;
    }

    /* ── Breadcrumb ── */
    .breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 2px;
      margin-bottom: 20px;
      font-size: 14px;
      color: var(--muted);
    }

    .breadcrumb a {
      color: var(--primary);
      text-decoration: none;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background 150ms;
    }

    .breadcrumb a:hover { background: var(--bg-3); }
    .breadcrumb__sep { margin: 0 2px; user-select: none; }
    .breadcrumb__current { font-weight: 600; color: var(--text); }

    /* ── Section header ── */
    .section-hd {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 28px 0 12px;
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: .07em;
    }

    .section-hd svg { width: 15px; height: 15px; flex-shrink: 0; }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 1px 8px;
      border-radius: 20px;
      background: var(--bg-3);
      border: 1px solid var(--border);
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
    }

    /* ── Folder grid ── */
    .folder-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }

    .folder-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-2);
      color: var(--text);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: border-color 150ms, box-shadow 150ms, transform 100ms;
      overflow: hidden;
    }

    .folder-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .folder-card svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: var(--primary);
    }

    .folder-card span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Image grid ── */
    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
    }

    .image-card {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--bg-2);
      overflow: hidden;
      cursor: pointer;
      transition: border-color 150ms, box-shadow 150ms, transform 100ms;
    }

    .image-card:hover, .image-card:focus-visible {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      outline: none;
    }

    .image-card__thumb {
      width: 100%;
      padding-top: 75%;
      position: relative;
      background: var(--bg-3);
    }

    .image-card__thumb img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 8px;
    }

    .image-card__name {
      padding: 6px 10px;
      font-size: 12px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-top: 1px solid var(--border);
    }

    /* ── Empty state ── */
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 64px 20px;
      color: var(--muted);
      text-align: center;
    }

    .empty svg { width: 48px; height: 48px; opacity: .35; }

    /* ── Modal ── */
    .modal {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 100;
      background: rgba(0,0,0,.7);
      backdrop-filter: blur(4px);
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .modal.is-open { display: flex; }

    .modal__box {
      position: relative;
      width: min(860px, 100%);
      max-height: 92dvh;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal__header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-2);
      flex-shrink: 0;
    }

    .modal__filename {
      flex: 1;
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .modal__nav {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .modal__nav-btn, .modal__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      transition: color 150ms, border-color 150ms;
    }

    .modal__nav-btn:hover:not(:disabled),
    .modal__close:hover { color: var(--primary); border-color: var(--primary); }
    .modal__close:hover { color: var(--danger); border-color: var(--danger); }
    .modal__nav-btn:disabled { opacity: .3; cursor: default; }
    .modal__nav-btn svg, .modal__close svg { width: 15px; height: 15px; pointer-events: none; }

    .modal__preview {
      flex: 1;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28px;
      /* checkerboard — visible only behind transparent images */
      background-color: var(--bg-3);
      background-image:
        linear-gradient(45deg, var(--bg-2) 25%, transparent 25%),
        linear-gradient(-45deg, var(--bg-2) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, var(--bg-2) 75%),
        linear-gradient(-45deg, transparent 75%, var(--bg-2) 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
      min-height: 160px;
    }

    .modal__preview img {
      max-width: 100%;
      max-height: 58dvh;
      object-fit: contain;
      border-radius: 4px;
    }

    .modal__footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--border);
      background: var(--bg-2);
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .modal__url {
      flex: 1;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: var(--radius);
      font-family: var(--font);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 150ms, color 150ms, border-color 150ms, opacity 150ms;
      flex-shrink: 0;
    }

    .btn svg { width: 15px; height: 15px; flex-shrink: 0; pointer-events: none; }
    .btn:disabled { opacity: .5; cursor: default; }

    .btn--outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
    }

    .btn--outline:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }

    .btn--primary {
      background: var(--primary);
      border: 1px solid var(--primary);
      color: #fff;
    }

    .btn--primary:hover:not(:disabled) { background: var(--primary-dark); border-color: var(--primary-dark); }

    /* ── Toast ── */
    .toasts {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 200;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: var(--radius);
      background: #1c1e21;
      color: #e3e3e3;
      font-size: 14px;
      font-weight: 500;
      box-shadow: var(--shadow-md);
      animation: toast-in 200ms ease;
    }

    [data-theme='dark'] .toast { background: #e3e3e3; color: #1c1e21; }

    .toast svg { width: 16px; height: 16px; flex-shrink: 0; }
    .toast--error { background: var(--danger) !important; color: #fff !important; }

    @keyframes toast-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .hidden { display: none !important; }

    @media (max-width: 600px) {
      .toolbar { height: 48px; padding: 0 12px; }
      .toolbar__search { width: 140px; }
      .content { padding: 16px 12px 32px; }
      .image-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
      .folder-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
      .modal__footer { gap: 6px; }
      .btn { padding: 6px 10px; font-size: 12px; }
    }
  </style>
</head>
<body>

<!-- ── Toolbar ── -->
<header class="toolbar">
  <a class="toolbar__logo" href="?dir=">📸 Galerie</a>
  <div class="toolbar__sep"></div>
  <input
    class="toolbar__search"
    id="search"
    type="search"
    placeholder="Filtrer…"
    autocomplete="off"
    spellcheck="false"
    aria-label="Filtrer les images"
  >
  <button class="toolbar__btn" id="theme-toggle" title="Basculer thème clair/sombre" aria-label="Basculer le thème">
    <!-- sun -->
    <svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41Zm13.44 13.44a1 1 0 0 1 1.41 0l.71.71a1 1 0 1 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41ZM2 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm17 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM4.22 19.78a1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41 0ZM17.66 6.34a1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1-1.41 0Z"/>
    </svg>
    <!-- moon -->
    <svg id="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="hidden" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
    </svg>
  </button>
</header>

<!-- ── Main content ── -->
<main class="content">

  <!-- Breadcrumb -->
  <nav class="breadcrumb" aria-label="Fil d'Ariane">
    <?php foreach ($crumbs as $i => $crumb): ?>
      <?php if ($i > 0): ?><span class="breadcrumb__sep" aria-hidden="true">/</span><?php endif; ?>
      <?php if ($i < count($crumbs) - 1): ?>
        <a href="<?= h($crumb['url']) ?>"><?= h($crumb['label']) ?></a>
      <?php else: ?>
        <span class="breadcrumb__current"><?= h($crumb['label']) ?></span>
      <?php endif; ?>
    <?php endforeach; ?>
  </nav>

  <!-- Subdirectories -->
  <?php if (!empty($subdirs)): ?>
  <div class="section-hd" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/>
    </svg>
    Dossiers <span class="badge"><?= count($subdirs) ?></span>
  </div>
  <div class="folder-grid">
    <?php foreach ($subdirs as $dir):
      $sub = $currentRel !== '' ? $currentRel . '/' . $dir : $dir;
    ?>
      <a class="folder-card" href="?dir=<?= urlencode($sub) ?>" data-name="<?= h($dir) ?>">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z"/>
        </svg>
        <span title="<?= h($dir) ?>"><?= h($dir) ?></span>
      </a>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>

  <!-- Images -->
  <?php if (!empty($files)): ?>
  <div class="section-hd" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM5 17l3.5-4.5 2.5 3 3.5-4.5L19 17H5Z"/>
    </svg>
    Images <span class="badge" id="image-count"><?= count($files) ?></span>
  </div>
  <div class="image-grid" id="image-grid">
    <?php foreach ($files as $idx => $file):
      $url = publicUrl($currentDir . DIRECTORY_SEPARATOR . $file);
    ?>
      <div
        class="image-card"
        data-url="<?= h($url) ?>"
        data-name="<?= h(strtolower($file)) ?>"
        data-idx="<?= $idx ?>"
        tabindex="0"
        role="button"
        aria-label="Aperçu de <?= h($file) ?>"
      >
        <div class="image-card__thumb">
          <img src="<?= h($url) ?>" alt="<?= h($file) ?>" loading="lazy" decoding="async">
        </div>
        <div class="image-card__name"><?= h($file) ?></div>
      </div>
    <?php endforeach; ?>
  </div>
  <?php elseif (empty($subdirs)): ?>
  <div class="empty">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM5 17l3.5-4.5 2.5 3 3.5-4.5L19 17H5Z"/>
    </svg>
    <p>Aucune image dans ce dossier.</p>
  </div>
  <?php endif; ?>

</main>

<!-- ── Modal ── -->
<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-filename">
  <div class="modal__box">

    <div class="modal__header">
      <span class="modal__filename" id="modal-filename"></span>
      <div class="modal__nav" role="group" aria-label="Navigation">
        <button class="modal__nav-btn" id="modal-prev" aria-label="Image précédente (←)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button class="modal__nav-btn" id="modal-next" aria-label="Image suivante (→)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
      <button class="modal__close" id="modal-close" aria-label="Fermer (Échap)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="modal__preview" id="modal-preview">
      <img id="modal-img" src="" alt="">
    </div>

    <div class="modal__footer">
      <span class="modal__url" id="modal-url"></span>
      <button class="btn btn--outline" id="btn-copy-url" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        URL
      </button>
      <button class="btn btn--primary" id="btn-copy-img" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copier l'image
      </button>
    </div>

  </div>
</div>

<!-- ── Toasts ── -->
<div class="toasts" id="toasts" aria-live="polite" aria-atomic="false"></div>

<script>
(function () {
  'use strict';

  // ── Theme ────────────────────────────────────────────────────────────────

  var html = document.documentElement;

  function applyTheme(dark) {
    html.dataset.theme = dark ? 'dark' : 'light';
    document.getElementById('icon-sun').classList.toggle('hidden', dark);
    document.getElementById('icon-moon').classList.toggle('hidden', !dark);
  }

  (function initTheme() {
    var stored = localStorage.getItem('gallery-theme');
    var prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored ? stored === 'dark' : prefersDark);
  }());

  document.getElementById('theme-toggle').addEventListener('click', function () {
    var isDark = html.dataset.theme !== 'dark';
    applyTheme(isDark);
    localStorage.setItem('gallery-theme', isDark ? 'dark' : 'light');
  });

  // ── Search / filter ──────────────────────────────────────────────────────

  var searchInput  = document.getElementById('search');
  var imageCount   = document.getElementById('image-count');
  var folderCards  = document.querySelectorAll('.folder-card');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      var q = this.value.toLowerCase().trim();
      var visible = 0;

      // Filter image cards
      document.querySelectorAll('#image-grid .image-card').forEach(function (card) {
        var match = q === '' || card.dataset.name.includes(q);
        card.classList.toggle('hidden', !match);
        if (match) visible++;
      });

      // Filter folder cards
      folderCards.forEach(function (card) {
        var match = q === '' || card.dataset.name.toLowerCase().includes(q);
        card.classList.toggle('hidden', !match);
      });

      if (imageCount) {
        imageCount.textContent = q === '' ? '<?= count($files) ?>' : String(visible);
      }
    });
  }

  // ── Modal ────────────────────────────────────────────────────────────────

  var modal       = document.getElementById('modal');
  var modalImg    = document.getElementById('modal-img');
  var modalName   = document.getElementById('modal-filename');
  var modalUrlEl  = document.getElementById('modal-url');
  var btnPrev     = document.getElementById('modal-prev');
  var btnNext     = document.getElementById('modal-next');
  var currentIdx  = -1;

  function visibleCards() {
    return Array.from(document.querySelectorAll('#image-grid .image-card:not(.hidden)'));
  }

  function openModal(idx) {
    var cards = visibleCards();
    if (idx < 0 || idx >= cards.length) return;
    currentIdx = idx;

    var card = cards[currentIdx];
    var relUrl = card.dataset.url;               // e.g. /img/v2/foo.webp
    var absUrl = location.protocol + '//' + location.host + relUrl;
    var name   = card.querySelector('.image-card__name').textContent;

    modalImg.src        = relUrl;
    modalImg.alt        = name;
    modalName.textContent = name;
    modalUrlEl.textContent = absUrl;
    modalUrlEl.title       = absUrl;

    btnPrev.disabled = currentIdx === 0;
    btnNext.disabled = currentIdx === cards.length - 1;

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close').focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    modalImg.src = '';
  }

  function navigate(delta) {
    openModal(currentIdx + delta);
  }

  // Open on card click / keyboard
  var grid = document.getElementById('image-grid');
  if (grid) {
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.image-card');
      if (!card) return;
      openModal(visibleCards().indexOf(card));
    });
    grid.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest('.image-card');
      if (!card) return;
      e.preventDefault();
      openModal(visibleCards().indexOf(card));
    });
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  btnPrev.addEventListener('click', function () { navigate(-1); });
  btnNext.addEventListener('click', function () { navigate(1); });

  // Backdrop click
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

  // Keyboard shortcuts
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape')      { closeModal(); }
    if (e.key === 'ArrowLeft')   { e.preventDefault(); navigate(-1); }
    if (e.key === 'ArrowRight')  { e.preventDefault(); navigate(1); }
  });

  // ── Clipboard ────────────────────────────────────────────────────────────

  function toast(msg, isError) {
    var el = document.createElement('div');
    el.className = 'toast' + (isError ? ' toast--error' : '');
    var icon = isError
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 12l2 2 4-4M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Z"/></svg>';
    el.innerHTML = icon + ' ' + msg;
    document.getElementById('toasts').appendChild(el);
    setTimeout(function () { el.remove(); }, 2800);
  }

  // Copy URL
  document.getElementById('btn-copy-url').addEventListener('click', function () {
    var url = location.protocol + '//' + location.host + modalImg.getAttribute('src');
    if (!navigator.clipboard) {
      toast('Clipboard non disponible (HTTPS requis)', true);
      return;
    }
    navigator.clipboard.writeText(url).then(
      function () { toast('URL copiée dans le presse-papier'); },
      function () { toast('Échec de la copie', true); }
    );
  });

  // Copy image (PNG blob — Teams/Outlook-compatible)
  document.getElementById('btn-copy-img').addEventListener('click', function () {
    var btn = this;
    var src = modalImg.getAttribute('src');

    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      toast('API Clipboard non supportée par ce navigateur', true);
      return;
    }

    btn.disabled = true;

    var isSvg = src.toLowerCase().endsWith('.svg');
    var blobPromise = isSvg ? svgToPng(src) : fetchBlob(src);

    blobPromise.then(function (blob) {
      // Always write as image/png — widest app compatibility
      var item = new ClipboardItem({ 'image/png': blob });
      return navigator.clipboard.write([item]);
    }).then(function () {
      toast('Image copiée (PNG) dans le presse-papier');
    }).catch(function (err) {
      toast('Impossible de copier : ' + err.message, true);
    }).finally(function () {
      btn.disabled = false;
    });
  });

  function fetchBlob(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.blob();
    }).then(function (blob) {
      // Convert non-PNG blobs to PNG via canvas so ClipboardItem always gets image/png
      if (blob.type === 'image/png') return blob;
      return blobToPng(blob);
    });
  }

  function blobToPng(blob) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () {
        var canvas = canvasFromImg(img);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (b) {
          b ? resolve(b) : reject(new Error('canvas.toBlob a échoué'));
        }, 'image/png');
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Chargement image échoué')); };
      img.src = url;
    });
  }

  // SVG → PNG: load as Image then draw to canvas
  function svgToPng(svgUrl) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        var canvas = canvasFromImg(img);
        canvas.toBlob(function (b) {
          b ? resolve(b) : reject(new Error('canvas.toBlob a échoué'));
        }, 'image/png');
      };
      img.onerror = function () { reject(new Error('Chargement SVG échoué')); };
      img.src = svgUrl;
    });
  }

  function canvasFromImg(img) {
    var w = img.naturalWidth  || 256;
    var h = img.naturalHeight || 256;
    var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas;
  }

}());
</script>
</body>
</html>
