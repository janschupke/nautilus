<?php
header('Content-Type: application/json');

$body = file_get_contents('php://input');

echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'] ?? '',
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? '',
    'body' => $body,
    'body_sha256' => hash('sha256', $body),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
