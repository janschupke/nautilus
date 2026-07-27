FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

RUN rm -f /etc/dpkg/dpkg.cfg.d/excludes \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
    apache2 \
    bash-completion \
    binutils \
    bc \
    bzip2 \
    ca-certificates \
    coreutils \
    curl \
    diffutils \
    dnsutils \
    ed \
    file \
    findutils \
    ftp \
    gawk \
    git \
    grep \
    gzip \
    hostname \
    htop \
    hydra \
    inetutils-telnet \
    iproute2 \
    iputils-ping \
    iputils-tracepath \
    jq \
    kmod \
    less \
    lftp \
    locales \
    lsof \
    man-db \
    manpages \
    manpages-dev \
    nano \
    net-tools \
    netcat-openbsd \
    nmap \
    openssh-client \
    openssh-server \
    openssl \
    parallel \
    patch \
    postgresql-client \
    procps \
    psmisc \
    pv \
    python3 \
    readline-common \
    ripgrep \
    rsync \
    sed \
    shellcheck \
    socat \
    strace \
    sudo \
    sysstat \
    tar \
    tcpdump \
    time \
    traceroute \
    tree \
    tshark \
    unzip \
    util-linux \
    vim-tiny \
    wget \
    xxd \
    whois \
    libimage-exiftool-perl \
    xz-utils \
    zip \
  && sed -i 's/^# *\(en_US.UTF-8 UTF-8\)/\1/' /etc/locale.gen \
  && locale-gen \
  && rm -rf /var/lib/apt/lists/*

# Create users and core directories
RUN useradd -m -s /bin/bash isopod \
  && echo "isopod:isopod" | chpasswd \
  && groupadd -r appops \
  && useradd -m -s /bin/bash -G appops deploy \
  && useradd -m -s /usr/sbin/nologin backupsvc \
  && useradd -m -s /bin/bash analyst \
  && usermod -aG sudo isopod \
  && mkdir -p /var/run/sshd \
  && printf "isopod ALL=(ALL) NOPASSWD:ALL\n" >/etc/sudoers.d/isopod \
  && chmod 0440 /etc/sudoers.d/isopod \
  && sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config \
  && sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

# Install ffuf (web content discovery) — pinned binary release
RUN set -eux; \
    ARCH=$(dpkg --print-architecture); \
    case "$ARCH" in \
      amd64) FFUF_ARCH=linux_amd64 ;; \
      arm64) FFUF_ARCH=linux_arm64 ;; \
      *) echo "Unsupported arch: $ARCH" && exit 1 ;; \
    esac; \
    curl -fsSL "https://github.com/ffuf/ffuf/releases/download/v2.1.0/ffuf_2.1.0_${FFUF_ARCH}.tar.gz" \
      | tar -xzC /usr/local/bin ffuf; \
    chmod +x /usr/local/bin/ffuf

# Install Mike Farah yq v4 (Debian's `yq` package is a different Python wrapper)
RUN set -eux; \
    ARCH=$(dpkg --print-architecture); \
    case "$ARCH" in \
      amd64) YQ_ARCH=amd64 ;; \
      arm64) YQ_ARCH=arm64 ;; \
      *) echo "Unsupported arch: $ARCH" && exit 1 ;; \
    esac; \
    curl -fsSL "https://github.com/mikefarah/yq/releases/download/v4.44.6/yq_linux_${YQ_ARCH}" \
      -o /usr/local/bin/yq; \
    chmod +x /usr/local/bin/yq

# Copy setup and entrypoint scripts
COPY lab/scripts/setup-labs.sh /usr/local/bin/setup-labs.sh
COPY lab/hosts/client/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/setup-labs.sh /usr/local/bin/entrypoint

# Copy seed lab materials
COPY lab/hosts/client/labs/ /home/isopod/labs/
RUN chown -R isopod:isopod /home/isopod

EXPOSE 22

ENTRYPOINT ["/usr/local/bin/entrypoint"]
