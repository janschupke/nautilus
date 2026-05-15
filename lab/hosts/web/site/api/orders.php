<?php
header('Content-Type: application/json');

echo json_encode([
    'orders' => [
        ['id' => 'ord-1001', 'owner' => 'alice', 'total' => 19.95, 'status' => 'paid'],
        ['id' => 'ord-1002', 'owner' => 'cee', 'total' => 7.50, 'status' => 'pending'],
        ['id' => 'ord-1003', 'owner' => 'alice', 'total' => 42.00, 'status' => 'paid'],
    ],
], JSON_PRETTY_PRINT);
