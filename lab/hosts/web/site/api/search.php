<?php
header('Content-Type: application/json');

$query = strtolower($_GET['q'] ?? '');
$documents = [
    ['id' => 'doc-1', 'title' => 'Nautilus safety checklist', 'tags' => ['shell', 'safety']],
    ['id' => 'doc-2', 'title' => 'HTTP debugging with curl', 'tags' => ['http', 'curl']],
    ['id' => 'doc-3', 'title' => 'Recursive downloads with wget', 'tags' => ['http', 'wget']],
];

$results = array_values(array_filter($documents, function ($doc) use ($query) {
    if ($query === '') {
        return true;
    }

    return str_contains(strtolower($doc['title']), $query)
        || in_array($query, $doc['tags'], true);
}));

echo json_encode([
    'query' => $query,
    'count' => count($results),
    'results' => $results,
], JSON_PRETTY_PRINT);
