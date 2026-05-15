<?php
$pages = [
    '/api/status.php' => 'JSON service status',
    '/api/echo.php?q=shell' => 'Request echo API',
    '/api/inspect.php' => 'Request body inspection API',
    '/api/users.php' => 'Sample users API',
    '/api/orders.php' => 'Sample orders API',
    '/api/search.php?q=shell' => 'Search API',
    '/api/db.php' => 'Optional PostgreSQL connectivity check',
    '/downloads/manual.txt' => 'Download fixture',
    '/downloads/report.php' => 'Content-Disposition download',
    '/redirect-manual.php' => 'Redirect to manual',
    '/admin/login.php' => 'Lab login form',
];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Nautilus LAN Lab</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <h1>Nautilus LAN Lab</h1>
  <p>This intentionally small PHP site is for curl, wget, API, and scoped auth exercises.</p>
  <p>Authorized target: <strong>10.77.0.20</strong> inside the lab network.</p>
  <h2>Useful paths</h2>
  <ul>
    <?php foreach ($pages as $href => $label): ?>
      <li><a href="<?= htmlspecialchars($href) ?>"><?= htmlspecialchars($label) ?></a></li>
    <?php endforeach; ?>
  </ul>
</body>
</html>
