<?php
header('Content-Type: application/json');
header('X-Request-Id: req-lan-4077');

echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'GET',
    'query' => $_GET,
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
