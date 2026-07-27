<?php
header('Content-Type: application/json');
header('X-Lab-Host: lab-web');

echo json_encode([
    'status' => 'ok',
    'service' => 'nautilus-lab-web',
    'build' => 'topology-2026',
    'targets' => [
        'client' => '10.78.8.10',
        'lan-client' => '10.78.8.11',
        'lab-web' => '10.78.8.20',
        'db' => '10.78.8.30',
        'exchange-ftp' => '10.78.8.40',
        'exchange-smtp' => '10.78.8.41',
        'vpn' => '10.78.8.2',
    ],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
