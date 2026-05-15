FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    wget \
    cron \
    locales \
    procps \
  && sed -i 's/^# *\(en_US.UTF-8 UTF-8\)/\1/' /etc/locale.gen \
  && locale-gen \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash user \
  && mkdir -p /var/log/user

# Create cron job to simulate user traffic
RUN printf "#!/bin/bash\n" > /usr/local/bin/traffic-gen.sh \
  && printf "curl -s http://10.78.8.20/ > /dev/null 2>&1\n" >> /usr/local/bin/traffic-gen.sh \
  && printf "curl -s http://10.78.8.20/api/status.php > /dev/null 2>&1\n" >> /usr/local/bin/traffic-gen.sh \
  && chmod +x /usr/local/bin/traffic-gen.sh

# Setup crontab for user: every 5 minutes
RUN printf "*/5 * * * * /usr/local/bin/traffic-gen.sh >> /var/log/user/traffic.log 2>&1\n" | crontab -

# Entrypoint to start cron and keep container running
RUN printf "#!/bin/bash\nset -euo pipefail\necho 'LAN client starting...'\ncron -f\n" > /usr/local/bin/entrypoint.sh \
  && chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
