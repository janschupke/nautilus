<?php
header('Content-Type: application/json');

$host = getenv('LAB_POSTGRES_HOST') ?: '10.77.0.30';
$db = getenv('LAB_POSTGRES_DB') ?: 'nautilus';
$user = getenv('LAB_POSTGRES_USER') ?: 'isopod';
$password = getenv('LAB_POSTGRES_PASSWORD') ?: 'isopod';

try {
    $pdo = new PDO("pgsql:host={$host};dbname={$db}", $user, $password, [
        PDO::ATTR_TIMEOUT => 2,
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $version = $pdo->query('select version()')->fetchColumn();

    echo json_encode([
        'status' => 'ok',
        'host' => $host,
        'database' => $db,
        'version' => $version,
    ], JSON_PRETTY_PRINT);
} catch (Throwable $error) {
    http_response_code(503);
    echo json_encode([
        'status' => 'unavailable',
        'host' => $host,
        'database' => $db,
        'message' => 'Start the db or full profile to enable PostgreSQL exercises.',
    ], JSON_PRETTY_PRINT);
}
