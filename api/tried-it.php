<?php
declare(strict_types=1);

// ── Configuration ─────────────────────────────────────────────────────────────
// Copy api/.env.example to api/.env and set your values before deploying.
$_envVars = file_exists(__DIR__ . '/.env')
    ? (parse_ini_file(__DIR__ . '/.env') ?: [])
    : [];

define('ADMIN_EMAIL',             $_envVars['ADMIN_EMAIL'] ?? '');
define('ADMIN_TOKEN',             $_envVars['ADMIN_TOKEN'] ?? '');
define('NOTIFY_COOLDOWN_SECONDS', 21600); // 6h — minimum gap between alert emails per article
define('ALERT_MIN_VOTES',         10);    // minimum votes before the failure ratio is meaningful
define('ALERT_FAILURE_RATIO',     0.30);  // send an alert once didn't-work votes exceed this share
define('SITE_URL',                'https://www.avonture.be');

// ── CORS ──────────────────────────────────────────────────────────────────────
$allowedOrigins = [
    SITE_URL,
    'https://localhost:3000',
];

// Same-origin requests carry no Origin header — allow them unconditionally.
// Only cross-origin requests need to be validated.
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

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// Sends an alert email when a tutorial's failure ratio crosses the threshold,
// with a per-article cooldown so a flaky run of votes doesn't spam the inbox.
function maybeAlert(string $slug, array $counts): void
{
    $total = $counts['worked'] + $counts['didnt_work'];
    if ($total < ALERT_MIN_VOTES) {
        return;
    }

    $failureRatio = $counts['didnt_work'] / $total;
    if ($failureRatio <= ALERT_FAILURE_RATIO) {
        return;
    }

    $throttleFile = __DIR__ . '/tried-it-notifications.json';
    $throttle     = loadData($throttleFile);

    if (time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS) {
        return;
    }

    $articleUrl  = SITE_URL . '/' . $slug;
    $successRate = round((1 - $failureRatio) * 100);

    $subject = "[Blog] \xE2\x9A\xA0\xEF\xB8\x8F Tutorial may be broken: $slug";
    $body    = implode("\n", [
        "Readers are struggling to reproduce the steps in one of your tutorials.",
        "",
        "Article      : $articleUrl",
        "Success rate : {$successRate}% ({$counts['didnt_work']} failures out of $total attempts)",
        "",
        "Consider reviewing the steps.",
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

// ── Parse input ───────────────────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'];
$slug   = '';
$vote   = '';

if ($method === 'GET') {
    // Admin request: return all tried-it data
    if (array_key_exists('admin', $_GET)) {
        if (ADMIN_TOKEN === '' || ($_GET['admin'] ?? '') !== ADMIN_TOKEN) {
            jsonError(403, 'Forbidden');
        }
        echo json_encode(loadData(__DIR__ . '/tried-it-data.json'));
        exit;
    }
    $slug = sanitizeSlug($_GET['slug'] ?? '');
} elseif ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $slug = sanitizeSlug($body['slug'] ?? '');
    $vote = $body['vote'] ?? '';
} else {
    jsonError(405, 'Method not allowed');
}

if ($slug === '') {
    jsonError(400, 'Missing slug');
}

// ── Load data ─────────────────────────────────────────────────────────────────

$dataFile = __DIR__ . '/tried-it-data.json';
$data     = loadData($dataFile);

if (!isset($data[$slug])) {
    $data[$slug] = ['worked' => 0, 'didnt_work' => 0];
}

// ── Record vote ───────────────────────────────────────────────────────────────

if ($method === 'POST') {
    if ($vote === 'worked') {
        $data[$slug]['worked']++;
    } elseif ($vote === 'didnt_work') {
        $data[$slug]['didnt_work']++;
    } else {
        jsonError(400, 'Invalid vote value');
    }
    saveData($dataFile, $data);
    maybeAlert($slug, $data[$slug]);
}

echo json_encode($data[$slug]);
