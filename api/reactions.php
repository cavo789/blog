<?php
declare(strict_types=1);

// ── Configuration ─────────────────────────────────────────────────────────────
// Change ADMIN_TOKEN to a long random string before deploying.
// The dashboard page reads it from the URL hash and sends it as a query param.
define('ADMIN_EMAIL',            'cavo789@gmail.com');
define('ADMIN_TOKEN',            '18wNSuCb6HamS9P6oeDa8dR6s2AOpr');
define('NOTIFY_COOLDOWN_SECONDS', 3600);   // minimum gap between emails per article
define('SITE_URL',               'https://www.avonture.be');

// ── CORS ──────────────────────────────────────────────────────────────────────
$allowedOrigins = [
    SITE_URL,
    'http://localhost:3000',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Vary: Origin');

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

// Sends an email notification for a new vote, with a per-article cooldown.
function maybeNotify(string $slug, string $vote, array $counts): void
{
    $throttleFile = __DIR__ . '/notifications.json';
    $throttle     = loadData($throttleFile);

    if (time() - ($throttle[$slug] ?? 0) < NOTIFY_COOLDOWN_SECONDS) {
        return;
    }

    $articleUrl   = SITE_URL . '/' . $slug;
    $dashboardUrl = SITE_URL . '/reactions-dashboard';
    $total        = $counts['helpful'] + $counts['not_helpful'];
    $ratio        = $total > 0 ? round($counts['helpful'] / $total * 100) : 0;

    $subject = "[Blog] New reaction on: $slug";
    $body    = implode("\n", [
        "A reader just reacted to one of your blog posts.",
        "",
        "Article     : $articleUrl",
        "Vote        : $vote",
        "Helpful     : {$counts['helpful']}",
        "Not helpful : {$counts['not_helpful']}",
        "Approval    : {$ratio}%",
        "",
        "View full dashboard: $dashboardUrl",
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
    // Admin request: return all reaction data
    if (array_key_exists('admin', $_GET)) {
        if (($_GET['admin'] ?? '') !== ADMIN_TOKEN) {
            jsonError(403, 'Forbidden');
        }
        echo json_encode(loadData(__DIR__ . '/reactions-data.json'));
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

$dataFile = __DIR__ . '/reactions-data.json';
$data     = loadData($dataFile);

if (!isset($data[$slug])) {
    $data[$slug] = ['helpful' => 0, 'not_helpful' => 0];
}

// ── Record vote ───────────────────────────────────────────────────────────────

if ($method === 'POST') {
    if ($vote === 'helpful') {
        $data[$slug]['helpful']++;
    } elseif ($vote === 'not_helpful') {
        $data[$slug]['not_helpful']++;
    } else {
        jsonError(400, 'Invalid vote value');
    }
    saveData($dataFile, $data);
    maybeNotify($slug, $vote, $data[$slug]);
}

echo json_encode($data[$slug]);
