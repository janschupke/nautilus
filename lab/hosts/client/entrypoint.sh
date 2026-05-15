#!/usr/bin/env bash
set -euo pipefail

# Generate SSH host keys
ssh-keygen -A

# Initialize lab data and fixtures
/usr/local/bin/setup-labs.sh

# Setup Apache for log analysis
a2dismod mpm_event mpm_worker 2>/dev/null || true
a2enmod rewrite headers mpm_prefork
sed -i 's/^#ServerName.*/ServerName client/' /etc/apache2/sites-available/000-default.conf

# Create Apache docroot with simple landing page
mkdir -p /var/www/lab
cat > /var/www/lab/index.html <<'HTML'
<!DOCTYPE html>
<html>
<head><title>Lab Client</title></head>
<body><h1>Lab Client</h1><p>Logs available at /var/log/apache2/</p></body>
</html>
HTML

cat >/etc/motd <<'MOTD'
Nautilus LAN lab - Client

User: isopod
Password: isopod

Seeded exercises live in:
  /home/isopod/labs

Web logs:
  /var/log/apache2/access.log
  /var/log/apache2/error.log

Lab targets:
  10.78.8.20  Webserver (PHP, REST API, login, DB)
  10.78.8.40  Exchange (FTP, SMTP, IMAP, POP3)
MOTD

# Start Apache in background, then SSH in foreground
/etc/init.d/apache2 start

exec /usr/sbin/sshd -D -e
