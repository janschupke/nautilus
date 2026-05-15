<?php
header('Content-Type: application/json');

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($username === 'cee' && $password === 'Pa55w0rdLab') {
    echo json_encode([
        'token' => 'lab-token-4077',
        'username' => $username,
        'scope' => 'lab-only',
    ], JSON_PRETTY_PRINT);
    exit;
}

http_response_code(401);
echo json_encode([
    'error' => 'invalid_credentials',
    'message' => 'Use only inside the authorized Nautilus LAN lab.',
], JSON_PRETTY_PRINT);
