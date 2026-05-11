# Expected repo structure and topic map

This file stays aligned with `overview.md`: same tier names, same constraints, and the same per-module file layout (`summary.md`, `assignment.md`, `solution.md`, `answers.md`, `data/`).

## Repository layout (top level)

```text
shell/
  docs/
    overview.md      # project intent and agent rules
    structure.md     # this file — topic map
    syllabus.md      # numbered sequence template
  NN-slug/           # each module: numbered prefix + short slug
    summary.md
    assignment.md
    solution.md
    answers.md
    data/
  lab/               # optional: shared local HTTP app, docker-compose, certs
  data/              # optional: cross-module fixtures
```

## Per-module contract (normative)

| File            | Role |
|-----------------|------|
| `summary.md`    | Concepts, flags worth remembering, Linux vs macOS notes. |
| `assignment.md` | Numbered tasks; practical, cumulative where useful. |
| `solution.md`   | Narrated solutions; multiple approaches when relevant. |
| `answers.md`    | Answers only, same numbering as assignments. |
| `data/`         | Inputs safe to commit; no secrets. |

---

## Tier 1 — Foundations (text, processes, filesystem discovery)

- **Shell and environment** — `bash`/`zsh` features used daily: history expansion, `set -euo pipefail`, job control, `env`, `export`, `ulimit`, `type` / `which` / `command`.
- **Finding and inspecting** — `find` (predicates, `-exec`, `-print0`), `locate` (where available), `file`, `strings`, `xxd` / `hexdump` (read-only inspection).
- **Text slicing** — `cut`, `paste`, `column`, `tr`, `wc`, `split`, `tee`.
- **Stream editors** — `sed` (in-place vs stdout, portability), `awk` (fields, BEGIN/END, common idioms).
- **Sorting and uniqueness** — `sort`, `uniq`, numeric vs lexical sort, stable sort notes.
- **Basic search** — `grep` / `rg` (ripgrep as optional faster path on dev machines), fixed-string vs regex; **not** a full PCRE deep-dive yet (see Tier 2).
- **Processes** — `ps` (BSD vs UNIX columns on macOS), `pgrep` / `pkill`, `top` / `htop`, `kill`, `killall`, `nice` / `renice`.
- **Filesystem layout literacy** — guided exploration of `/var/log`, `/etc`, `proc`/`sys` on Linux (theory + read-only exercises).

## Tier 2 — Intermediate (grep depth, archives, services, scheduling, diffs)

- **Grep ecosystem** — `grep -E`, `grep -F`, `grep -P` (GNU only; document absence on BSD grep), when to use `egrep`/`fgrep` compatibility names; extended examples vs Tier 1.
- **Diff and patch** — `diff`, `diff -u`, `patch`, comparing directory trees.
- **Archives and compression** — `tar` (create, extract, compress variants), `gzip` / `gunzip`, `zip` / `unzip`, `zstd` where installed.
- **Users and permissions** — `id`, `who`, `whoami`, `chmod`, `chown`, `umask`; POSIX ACLs overview on Linux (`getfacl` / `setfacl`) as optional add-on.
- **Service supervision (Linux)** — `systemctl` status/journal integration pointers, unit files at a **read-only** level unless lab VM is disposable.
- **Scheduling** — `crontab`, `@reboot`, macOS `launchctl` contrast (conceptual + safe examples).
- **System introspection** — `strace` / `dtrace` (platform-dependent), `lsof`, `ss` (Linux) vs `netstat` legacy, `df`, `du`, `mount` / `diskutil` (macOS).

## Tier 3 — Networking clients and crypto CLI

- **HTTP clients** — `curl` and `wget`: verbs, headers, auth, TLS verify toggles (lab-only), download resume, writing scripts around exit codes.
- **Remote copy and shell** — `scp`, `rsync` (delta sync, delete semantics — dangerous flags called out), `ssh` key types, `ssh-agent`, `ProxyJump`; sftp interactive vs batch.
- **Legacy / plaintext protocols** — `telnet`, `ftp`/`lftp`: **theory-first** or localhost lab; emphasize cleartext risk.
- **DNS** — `dig`, `host`, `nslookup` (legacy), resolver behavior, TTL, common record types.
- **Path and reachability** — `ping` / `ping6`, `traceroute` / `mtr` (if present), `whois` (rate limits and ToS).
- **TLS and certificates** — `openssl` subcommands for certs/CSRs, `s_client` for inspecting handshakes on **local** endpoints.
- **Swiss-army socket tools** — `nc` (OpenBSD `nc` vs traditional `nc` differences), `socat` for multiplexing and quick listeners **on lab interfaces only**.

## Tier 4 — Observability and packets (lab NIC, pcap, logs)

- **Capture** — `tcpdump` filters, file rotation, BPF syntax pointers; `tshark` for decode-heavy workflows.
- **Log pipelines** — `journalctl` (Linux), `tail -f`, `less +F`, correlating by time across files; optional `logrotate` awareness.

## Tier 5 — Structured data and shell ergonomics

- **JSON / YAML at the CLI** — `jq`, `yq` (document implementation flavors), merging with shell loops and `xargs -0`.
- **Parallelism and safety** — `xargs -P`, `parallel` (GNU) with warnings about quoting; `mktemp`, safe temp dirs.
- **Shell scripting discipline** — functions, `trap`, error messages, testing with `shellcheck` (invoke as external tool).

## Tier 6 — Security-oriented tooling (authorized lab only)

- **Port scanning and service fingerprinting** — `nmap` script categories, timing templates, **scope** and **legal** banner in every module.
- **Web discovery** — `gobuster` / `ffuf` / `feroxbuster` / `dirb` (pick one primary per exercise set), wordlists, status-code filtering.
- **Wordlist / target hygiene** — `cewl` (local site only), respecting `robots.txt` in real targets when applicable.
- **Password spraying / online brute force** — `hydra` or similar **only** against the **local lab** app with known credentials; separate “theory” block for real engagements.
- **Optional advanced** — `masscan` (needs raw sockets / caps), **VM-only**; link to syllabus as stretch, not default.

## Tier 7 — Cross-cutting practices

- **Script hygiene and reproducibility** — `git` from CLI for exercise repos, small `Makefile` or task runner optional.
- **Containers (optional)** — `docker` / `podman` for spinning up lab dependencies; `kubectl` only if cluster is local (minikube/k3d).
- **macOS vs Linux cheat sheet** — single module that links back to prior modules’ platform deltas.

---

## Pentesting / red-team adjacent topics (placement)

Treat Tier 6 items as **security engineering** skills: pair every offensive-adjacent exercise with **scope**, **logging**, and **defensive detection** notes. Do not duplicate `nc` under two names; one module covers netcat variants and flags.

## Dependencies between tiers

- Tier 2 assumes Tier 1 text and process comfort.
- Tier 3 assumes Tier 1–2 and working local TLS lab from `overview.md`.
- Tier 4 assumes Tier 3 socket literacy and a **capture-allowed** environment.
- Tier 5 can start after Tier 1; ideally after Tier 2 for `diff`-ing generated JSON.
- Tier 6 assumes Tier 3–4 and explicit lab setup.
