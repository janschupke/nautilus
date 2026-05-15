<?php
$ok = false;
$attempted = $_SERVER['REQUEST_METHOD'] === 'POST';

if ($attempted) {
    $ok = ($_POST['username'] ?? '') === 'cee'
        && ($_POST['password'] ?? '') === 'Pa55w0rdLab';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Lab Login</title>
</head>
<body>
  <h1>Lab Login</h1>
  <p>This login exists only for authorized local lab exercises.</p>
  <?php if ($attempted && $ok): ?>
    <p id="result">Welcome cee. Lab flag: LAN-AUTH-4077</p>
  <?php elseif ($attempted): ?>
    <p id="result">Invalid username or password.</p>
  <?php endif; ?>
  <form method="post">
    <label>Username <input name="username" autocomplete="username"></label>
    <label>Password <input name="password" type="password" autocomplete="current-password"></label>
    <button type="submit">Sign in</button>
  </form>
</body>
</html>
