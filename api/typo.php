<?php
declare(strict_types=1);

// ── Configuration ─────────────────────────────────────────────────────────────
$_envVars = file_exists(__DIR__ . '/.env')
    ? (parse_ini_file(__DIR__ . '/.env') ?: [])
    : [];

define('ADMIN_EMAIL',            $_envVars['ADMIN_EMAIL']    ?? '');
define('ADMIN_TOKEN',            $_envVars['ADMIN_TOKEN']    ?? '');
define('IP_HASH_SALT',           $_envVars['IP_HASH_SALT']   ?? '');
define('NONCE_SECRET',           $_envVars['NONCE_SECRET']   ?? '');
define('SITE_URL',               'https://www.avonture.be');

define('NONCE_COOLDOWN_SECONDS', 900);    // 15-min window for HMAC nonce
define('NOTIFY_COOLDOWN_SECONDS', 21600); // 6h between emails per article

define('GLOBAL_WINDOW',   60);   // global rate-limit window (seconds)
define('GLOBAL_MAX',      20);   // max requests in that window
define('IP_HOURLY_MAX',   10);   // max reports per IP per hour
define('IP_ARTICLE_MAX',  3);    // max reports per IP per article per 24h

// ── CORS ──────────────────────────────────────────────────────────────────────
$allowedOrigins = [
    SITE_URL,
    'http://localhost:3000',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
if ($origin !== '') {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Vary: Origin');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Helpers (verbatim from reactions.php) ─────────────────────────────────────

function loadData(string $file): array
{
    if (!file_exists($file)) {
        return [];
    }
    return json_decode(file_get_contents($file), true) ?: [];
}

function saveData(string $file, array $data): void
{
    $fp = fopen($file, 'c+');
    if (!$fp) {
        return;
    }
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

function sanitizeSlug(string $raw): string
{
    $slug = preg_replace('/[^a-z0-9\-\/]/', '', strtolower(trim($raw)));
    return substr($slug, 0, 200);
}

function jsonError(int $code, string $message): never
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

// ── Nonce ─────────────────────────────────────────────────────────────────────

function makeNonce(int $window): string
{
    return hash_hmac('sha256', $window . '|typo-report', NONCE_SECRET);
}

function validateNonce(string $candidate): bool
{
    $now  = (int) floor(time() / NONCE_COOLDOWN_SECONDS);
    // Accept current window and previous window to avoid edge-case expiry.
    return hash_equals(makeNonce($now), $candidate)
        || hash_equals(makeNonce($now - 1), $candidate);
}

// ── Input validation ──────────────────────────────────────────────────────────

function isPrintableUnicode(string $s): bool
{
    return (bool) preg_match('/^\P{C}+$/u', $s);
}

function validateAndSanitize(array $body): array
{
    // Honeypot — silently accept and return empty to trigger silent 200.
    if (($body['website'] ?? '') !== '') {
        return [];
    }

    $slug = sanitizeSlug($body['slug'] ?? '');
    if ($slug === '') {
        jsonError(400, 'Missing slug');
    }

    $text = trim($body['text'] ?? '');
    if (mb_strlen($text) < 3 || mb_strlen($text) > 150 || !isPrintableUnicode($text)) {
        jsonError(400, 'Invalid text');
    }

    $comment = trim($body['comment'] ?? '');
    if ($comment !== '' && (mb_strlen($comment) > 300 || !isPrintableUnicode($comment))) {
        jsonError(400, 'Invalid comment');
    }

    $context = trim($body['context'] ?? '');
    if (mb_strlen($context) > 300) {
        $context = mb_substr($context, 0, 300);
    }

    return compact('slug', 'text', 'comment', 'context');
}

// ── Rate limiting ─────────────────────────────────────────────────────────────

function checkRateLimits(string $slug): void
{
    $file  = __DIR__ . '/typo-ratelimit.json';
    $ip    = $_SERVER['REMOTE_ADDR'] ?? '';
    $ipKey = hash('sha256', IP_HASH_SALT . $ip);
    $now   = time();

    $fp = fopen($file, 'c+');
    if (!$fp) {
        return;
    }

    if (!flock($fp, LOCK_EX)) {
        fclose($fp);
        return;
    }

    $raw  = stream_get_contents($fp);
    $data = $raw !== '' ? (json_decode($raw, true) ?: []) : [];

    // ── Global sliding-window check ───────────────────────────────────────────
    $global = $data['__global__'] ?? ['window_start' => $now, 'count' => 0];
    if ($now - $global['window_start'] > GLOBAL_WINDOW) {
        $global = ['window_start' => $now, 'count' => 0];
    }
    $global['count']++;
    if ($global['count'] > GLOBAL_MAX) {
        flock($fp, LOCK_UN);
        fclose($fp);
        jsonError(429, 'Too many requests');
    }
    $data['__global__'] = $global;

    // ── Per-IP checks ─────────────────────────────────────────────────────────
    $ipData        = $data[$ipKey] ?? ['hourly' => [], 'articles' => []];
    $cutoffHour    = $now - 3600;
    $cutoffDay     = $now - 86400;

    // Prune old timestamps.
    $ipData['hourly']    = array_values(array_filter($ipData['hourly'],    fn($ts) => $ts > $cutoffHour));
    $ipData['articles']  = array_filter($ipData['articles'], fn($ts) => $ts > $cutoffDay);

    if (count($ipData['hourly']) >= IP_HOURLY_MAX) {
        flock($fp, LOCK_UN);
        fclose($fp);
        jsonError(429, 'Too many requests');
    }

    $articleCount = count(array_filter($ipData['articles'], fn($ts) => $ts > $cutoffDay, ARRAY_FILTER_USE_VALUES));
    // count per article for this IP
    $perArticleKey = $ipKey . '|' . $slug;
    $articlesForSlug = $data[$perArticleKey] ?? [];
    $articlesForSlug = array_values(array_filter($articlesForSlug, fn($ts) => $ts > $cutoffDay));
    if (count($articlesForSlug) >= IP_ARTICLE_MAX) {
        flock($fp, LOCK_UN);
        fclose($fp);
        jsonError(429, 'Too many requests');
    }

    // Record this request.
    $ipData['hourly'][]   = $now;
    $ipData['articles'][] = $now;
    $articlesForSlug[]    = $now;

    $data[$ipKey]          = $ipData;
    $data[$perArticleKey]  = $articlesForSlug;

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    flock($fp, LOCK_UN);
    fclose($fp);
}

// ── Deduplication ─────────────────────────────────────────────────────────────

function isDuplicate(string $slug, string $text): bool
{
    $dataFile = __DIR__ . '/typo-data.json';
    $data     = loadData($dataFile);
    $hash     = hash('sha256', $slug . '|' . mb_strtolower($text));
    foreach ($data[$slug] ?? [] as $report) {
        if (($report['text_hash'] ?? '') === $hash) {
            return true;
        }
    }
    return false;
}

// ── Store report ──────────────────────────────────────────────────────────────

function storeReport(array $fields): void
{
    ['slug' => $slug, 'text' => $text, 'comment' => $comment, 'context' => $context] = $fields;

    $dataFile = __DIR__ . '/typo-data.json';
    $ip       = $_SERVER['REMOTE_ADDR'] ?? '';

    $report = [
        'id'        => bin2hex(random_bytes(6)),
        'text'      => $text,
        'text_hash' => hash('sha256', $slug . '|' . mb_strtolower($text)),
        'context'   => $context,
        'comment'   => $comment,
        'ts'        => time(),
        'ip_hash'   => hash('sha256', IP_HASH_SALT . $ip),
    ];

    $fp = fopen($dataFile, 'c+');
    if (!$fp) {
        return;
    }
    if (flock($fp, LOCK_EX)) {
        $raw  = stream_get_contents($fp);
        $data = $raw !== '' ? (json_decode($raw, true) ?: []) : [];
        $data[$slug][] = $report;
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        flock($fp, LOCK_UN);
    }
    fclose($fp);
}

// ── Email notification ────────────────────────────────────────────────────────

function maybeNotifyTypo(string $slug, string $text): void
{
    $throttleFile = __DIR__ . '/typo-notifications.json';
    $throttle     = loadData($throttleFile);

    if (time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS) {
        return;
    }

    $articleUrl = SITE_URL . '/' . $slug;
    $subject    = "[Blog] Typo report on: $slug";
    $body       = implode("\n", [
        "A reader reported a potential typo.",
        "",
        "Article : $articleUrl",
        "Text    : $text",
        "",
        "Review all reports: GET " . SITE_URL . "/api/typo.php?admin=TOKEN",
    ]);
    $headers = implode("\r\n", [
        "From: noreply@avonture.be",
        "Reply-To: noreply@avonture.be",
        "Content-Type: text/plain; charset=utf-8",
    ]);

    if (@mail(ADMIN_EMAIL, $subject, $body, $headers)) {
        $throttle[$slug] = time();
        saveData($throttleFile, $throttle);
    }
}

// ── Router ────────────────────────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Nonce endpoint.
    if (array_key_exists('nonce', $_GET)) {
        $window = (int) floor(time() / NONCE_COOLDOWN_SECONDS);
        echo json_encode(['nonce' => makeNonce($window)]);
        exit;
    }

    // Admin endpoint.
    if (array_key_exists('admin', $_GET)) {
        if (ADMIN_TOKEN === '' || ($_GET['admin'] ?? '') !== ADMIN_TOKEN) {
            jsonError(403, 'Forbidden');
        }
        echo json_encode(loadData(__DIR__ . '/typo-data.json'));
        exit;
    }

    jsonError(400, 'Missing parameter');
}

if ($method !== 'POST') {
    jsonError(405, 'Method not allowed');
}

// ── POST flow ─────────────────────────────────────────────────────────────────

$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Nonce validation.
$nonce = $body['nonce'] ?? '';
if ($nonce === '' || !validateNonce($nonce)) {
    jsonError(403, 'Invalid nonce');
}

// Validate + sanitize — returns [] on honeypot hit.
$fields = validateAndSanitize($body);
if ($fields === []) {
    echo json_encode(['ok' => true]);
    exit;
}

['slug' => $slug, 'text' => $text] = $fields;

checkRateLimits($slug);

if (isDuplicate($slug, $text)) {
    echo json_encode(['ok' => true]);
    exit;
}

storeReport($fields);
maybeNotifyTypo($slug, $text);

echo json_encode(['ok' => true]);
