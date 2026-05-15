<?php
header('Content-Type: application/json');
header('X-Lab-Host: webserver');

echo json_encode([
    'status' => 'ok',
    'service' => 'nautilus-lab-webserver',
    'build' => 'topology-2026',
    'targets' => [
        'client' => '10.77.0.10',
        'lan-client' => '10.77.0.11',
        'webserver' => '10.77.0.20',
        'db' => '10.77.0.30',
        'exchange-ftp' => '10.77.0.40',
        'exchange-smtp' => '10.77.0.41',
        'vpn' => '10.77.0.2',
    ],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
