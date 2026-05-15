<?php
header('Content-Type: application/json');

echo json_encode([
    ['id' => 1, 'username' => 'alice', 'role' => 'reader', 'active' => true],
    ['id' => 2, 'username' => 'bob', 'role' => 'operator', 'active' => false],
    ['id' => 3, 'username' => 'cee', 'role' => 'admin', 'active' => true],
], JSON_PRETTY_PRINT);
