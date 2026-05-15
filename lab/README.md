# Nautilus LAN lab

This directory defines the local Docker LAN used by the Nautilus.

## Quick start

The entire network starts with a single command:

```bash
cd lab
docker compose up -d
```

SSH into the client:

```bash
ssh -p 2222 isopod@127.0.0.1
```

Lab credentials:

- User: `isopod`
- Password: `isopod`

Inside the SSH host, exercise fixtures live under `/home/isopod/labs`.

## Architecture

The lab simulates a small network with multiple services for exercise scenarios:

| IP | Host | Purpose |
| --- | --- | --- |
| `10.78.8.10` | `client` | SSH entry point; learner host with exercise fixtures and Apache logs |
| `10.78.8.11` | `lan-client` | Simulates background user traffic (cron HTTP requests to webserver every 5 min) |
| `10.78.8.20` | `webserver` | PHP website, REST API, login, database integration |
| `10.78.8.30` | `db` | PostgreSQL database |
| `10.78.8.40` | `exchange-ftp` | FTP service for file transfer exercises |
| `10.78.8.41` | `exchange-smtp` | SMTP / Mailpit — email exercises; web UI at http://127.0.0.1:8025 |
| `10.78.8.50` | `forensics-box` | Forensics analysis host for incident response and triage exercises |
| `10.78.8.2` | `vpn` | WireGuard gateway for direct LAN access from Docker Desktop hosts |

## Scenarios

**Client host** (`10.78.8.10`):
- SSH access for interactive exercises
- Apache running with access/error logs
- Local tools for analysis and debugging

**LAN client** (`10.78.8.11`):
- Simulates background user traffic
- Cron job makes HTTP requests to webserver every 5 minutes
- Useful for traffic analysis, intrusion detection, and network monitoring exercises

**Webserver** (`10.78.8.20`):
- PHP website with login functionality
- REST API endpoints
- Database connectivity for application layer exercises

**Exchange services** (`10.78.8.40`, `10.78.8.41`):
- FTP for file transfer protocols
- SMTP for email exercises (Mailpit with web UI on `http://127.0.0.1:8025`)

**Forensics host** (`10.78.8.50`):
- Compromised host scenario for incident response and triage exercises
- SSH in as `analyst` / `analyst` from the client host

## Network access

**From Docker host via SSH (easiest):**

```bash
ssh -p 2222 isopod@127.0.0.1
```

**Web services from host:**

```bash
# Client Apache logs
curl -v http://127.0.0.1:8000/

# Webserver API
curl http://127.0.0.1:8080/

# Mailpit web UI
open http://127.0.0.1:8025/
```

**From Docker host via bridge (macOS/Windows only with WireGuard):**

The `vpn` service provides a deterministic route into `10.78.8.0/24`. After startup:

```bash
docker compose exec vpn ls /config/peer_isopod
# Extract the wg config and import into WireGuard

# Then direct LAN access works:
ssh isopod@10.78.8.10
curl http://10.78.8.20/
```

## LAN traffic analysis

The `lan-client` service simulates realistic background traffic:

```bash
# SSH into client and watch requests from lan-client
ssh -p 2222 isopod@127.0.0.1

# In one terminal:
tail -f /var/log/apache2/access.log

# In another terminal (from lan-client):
curl http://10.78.8.20/
```

View the traffic generation script:

```bash
docker compose exec lan-client cat /usr/local/bin/traffic-gen.sh
docker compose exec lan-client tail -f /var/log/user/traffic.log
```

## Teardown

Reset the lab (containers and volumes):

```bash
docker compose down -v
```
