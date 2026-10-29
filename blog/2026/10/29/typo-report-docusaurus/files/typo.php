<?php
declare(strict_types=1);

$_envVars = file_exists(__DIR__ . '/.env')
    ? (parse_ini_file(__DIR__ . '/.env') ?: [])
    : [];

define('ADMIN_EMAIL',            $_envVars['ADMIN_EMAIL']    ?? '');
define('ADMIN_TOKEN',            $_envVars['ADMIN_TOKEN']    ?? '');
define('IP_HASH_SALT',           $_envVars['IP_HASH_SALT']   ?? '');
define('NONCE_SECRET',           $_envVars['NONCE_SECRET']   ?? '');
define('SITE_URL',               'https://www.yourdomain.com');

define('NONCE_COOLDOWN_SECONDS', 900);
define('NOTIFY_COOLDOWN_SECONDS', 21600);
define('GLOBAL_WINDOW',   60);
define('GLOBAL_MAX',      20);
define('IP_HOURLY_MAX',   10);
define('IP_ARTICLE_MAX',  3);

// ── CORS ──────────────────────────────────────────────────────────────────────
$allowedOrigins = [SITE_URL, 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403); exit;
}

header('Content-Type: application/json; charset=utf-8');
if ($origin !== '') {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Vary: Origin');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── Shared helpers ────────────────────────────────────────────────────────────
function loadData(string $file): array {
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true) ?: [];
}

function saveData(string $file, array $data): void {
    $fp = fopen($file, 'c+');
    if (!$fp) return;
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function sanitizeSlug(string $raw): string {
    return substr(preg_replace('/[^a-z0-9\-\/]/', '', strtolower(trim($raw))), 0, 200);
}

function jsonError(int $code, string $message): never {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

// ── Nonce ─────────────────────────────────────────────────────────────────────
function makeNonce(int $window): string {
    return hash_hmac('sha256', $window . '|typo-report', NONCE_SECRET);
}

function validateNonce(string $candidate): bool {
    $now = (int) floor(time() / NONCE_COOLDOWN_SECONDS);
    return hash_equals(makeNonce($now), $candidate)
        || hash_equals(makeNonce($now - 1), $candidate);
}

// ── Input validation ──────────────────────────────────────────────────────────
function validateAndSanitize(array $body): array {
    if (($body['website'] ?? '') !== '') return []; // honeypot

    $slug = sanitizeSlug($body['slug'] ?? '');
    if ($slug === '') jsonError(400, 'Missing slug');

    $text = trim($body['text'] ?? '');
    if (mb_strlen($text) < 3 || mb_strlen($text) > 150
        || !preg_match('/^\P{C}+$/u', $text)) jsonError(400, 'Invalid text');

    $allowedTypes = ['typo', 'incorrect', 'outdated', 'suggestion'];
    $type = trim($body['type'] ?? '');
    if (!in_array($type, $allowedTypes, true)) jsonError(400, 'Invalid type');

    $comment = trim($body['comment'] ?? '');
    if ($comment !== '' && (mb_strlen($comment) > 300
        || !preg_match('/^\P{C}+$/u', $comment))) jsonError(400, 'Invalid comment');

    $context = mb_substr(trim($body['context'] ?? ''), 0, 300);

    return compact('slug', 'text', 'type', 'comment', 'context');
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
function checkRateLimits(string $slug): void {
    $file  = __DIR__ . '/typo-ratelimit.json';
    $ip    = $_SERVER['REMOTE_ADDR'] ?? '';
    $ipKey = hash('sha256', IP_HASH_SALT . $ip);
    $now   = time();

    $fp = fopen($file, 'c+');
    if (!$fp || !flock($fp, LOCK_EX)) { if ($fp) fclose($fp); return; }

    $raw  = stream_get_contents($fp);
    $data = $raw !== '' ? (json_decode($raw, true) ?: []) : [];

    $g = $data['__global__'] ?? ['window_start' => $now, 'count' => 0];
    if ($now - $g['window_start'] > GLOBAL_WINDOW) $g = ['window_start' => $now, 'count' => 0];
    if (++$g['count'] > GLOBAL_MAX) { flock($fp, LOCK_UN); fclose($fp); jsonError(429, 'Too many requests'); }
    $data['__global__'] = $g;

    $ipData = $data[$ipKey] ?? ['hourly' => [], 'articles' => []];
    $ipData['hourly'] = array_values(array_filter($ipData['hourly'], fn($ts) => $ts > $now - 3600));
    if (count($ipData['hourly']) >= IP_HOURLY_MAX) { flock($fp, LOCK_UN); fclose($fp); jsonError(429, 'Too many requests'); }

    $artKey  = $ipKey . '|' . $slug;
    $artData = array_values(array_filter($data[$artKey] ?? [], fn($ts) => $ts > $now - 86400));
    if (count($artData) >= IP_ARTICLE_MAX) { flock($fp, LOCK_UN); fclose($fp); jsonError(429, 'Too many requests'); }

    $ipData['hourly'][] = $now;
    $artData[]          = $now;
    $data[$ipKey]       = $ipData;
    $data[$artKey]      = $artData;

    ftruncate($fp, 0); rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    flock($fp, LOCK_UN); fclose($fp);
}

// ── Dedup + store ─────────────────────────────────────────────────────────────
function isDuplicate(string $slug, string $text): bool {
    $hash = hash('sha256', $slug . '|' . mb_strtolower($text));
    foreach (loadData(__DIR__ . '/typo-data.json')[$slug] ?? [] as $r) {
        if (($r['text_hash'] ?? '') === $hash) return true;
    }
    return false;
}

function storeReport(array $fields): void {
    ['slug' => $slug, 'text' => $text, 'type' => $type,
     'comment' => $comment, 'context' => $context] = $fields;

    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $fp = fopen(__DIR__ . '/typo-data.json', 'c+');
    if (!$fp) return;
    if (flock($fp, LOCK_EX)) {
        $raw  = stream_get_contents($fp);
        $data = $raw !== '' ? (json_decode($raw, true) ?: []) : [];
        $data[$slug][] = [
            'id'        => bin2hex(random_bytes(6)),
            'type'      => $type,
            'text'      => $text,
            'text_hash' => hash('sha256', $slug . '|' . mb_strtolower($text)),
            'context'   => $context,
            'comment'   => $comment,
            'ts'        => time(),
            'ip_hash'   => hash('sha256', IP_HASH_SALT . $ip),
        ];
        ftruncate($fp, 0); rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function maybeNotifyTypo(string $slug, string $text, string $type): void {
    $file     = __DIR__ . '/typo-notifications.json';
    $throttle = loadData($file);
    if (time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS) return;

    $typeLabels = [
        'typo'       => '🔤 Typo',
        'incorrect'  => '❌ Incorrect info',
        'outdated'   => '⏰ Outdated content',
        'suggestion' => '💡 Suggestion',
    ];
    $typeLabel  = $typeLabels[$type] ?? $type;
    $articleUrl = SITE_URL . '/' . $slug;
    $subject    = "[Blog] Feedback ($type) on: $slug";
    $body       = implode("\n", [
        "A reader flagged an issue.",
        "",
        "Article : $articleUrl",
        "Type    : $typeLabel",
        "Text    : $text",
        "",
        "Review all reports: GET " . SITE_URL . "/api/typo.php?admin=TOKEN",
    ]);
    $headers = "From: noreply@yourdomain.com\r\nContent-Type: text/plain; charset=utf-8";

    if (@mail(ADMIN_EMAIL, $subject, $body, $headers)) {
        $throttle[$slug] = time();
        saveData($file, $throttle);
    }
}

// ── Router ────────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (array_key_exists('nonce', $_GET)) {
        echo json_encode(['nonce' => makeNonce((int) floor(time() / NONCE_COOLDOWN_SECONDS))]);
        exit;
    }
    if (array_key_exists('admin', $_GET)) {
        if (ADMIN_TOKEN === '' || ($_GET['admin'] ?? '') !== ADMIN_TOKEN) jsonError(403, 'Forbidden');
        echo json_encode(loadData(__DIR__ . '/typo-data.json'));
        exit;
    }
    jsonError(400, 'Missing parameter');
}

if ($method !== 'POST') jsonError(405, 'Method not allowed');

$body  = json_decode(file_get_contents('php://input'), true) ?? [];
$nonce = $body['nonce'] ?? '';
if ($nonce === '' || !validateNonce($nonce)) jsonError(403, 'Invalid nonce');

$fields = validateAndSanitize($body);
if ($fields === []) { echo json_encode(['ok' => true]); exit; }

['slug' => $slug, 'text' => $text] = $fields;

checkRateLimits($slug);

if (isDuplicate($slug, $text)) { echo json_encode(['ok' => true]); exit; }

storeReport($fields);
maybeNotifyTypo($slug, $text, $fields['type']);

echo json_encode(['ok' => true]);
