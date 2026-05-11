# Syllabus template (numbered sequence)

Copy this list into the repo root `README.md` or keep it here and replace each line’s slug when `NN-slug/` directories exist. **Order is intentional**: earlier topics supply pipes, temp files, and process literacy for later networking and security labs.

## How to use (agents)

1. Create one directory per line: `NN-kebab-case-slug/` matching the number below.
2. Fill `summary.md` → `assignment.md` → `solution.md` → `answers.md`; add `data/` fixtures.
3. If a topic is “theory-only” on the learner’s machine, state that in `summary.md` and still provide local substitutes in `assignment.md`.

---

## Sequential topics

1. **Shell environment and safe defaults** — `set`, shell options, strict mode, history, `mktemp`, exit codes.
2. **Finding files and metadata** — `find` depth, predicates, `-exec`, `-print0`, `xargs -0`, `locate` (optional).
3. **Inspecting unknown content** — `file`, `strings`, `xxd` / `hexdump`, size/time (`stat`).
4. **Text extraction and reshaping** — `cut`, `paste`, `column`, `tr`, `wc`, `split`, `tee`.
5. **`sed` for streaming edits** — line ranges, in-place with backup, portability pitfalls.
6. **`awk` for fields and reports** — patterns, `BEGIN`/`END`, common one-liners vs readable scripts.
7. **Sorting and deduplication** — `sort` keys, `uniq`, stable vs unstable behavior.
8. **Search basics** — `grep` / `rg`, line/binary modes, recursive search with ignores.
9. **Process listing and signals** — `ps`, `pgrep`, `pkill`, `top`/`htop`, `kill`/`killall`, jobs.
10. **Filesystem literacy** — `/var/log`, `/etc`, Linux `proc`/`sys` read-only tours; macOS analogs where applicable.
11. **Advanced grep and regex flavors** — `-E`/`-F`/`-P` (GNU), when to prefer `grep` vs `sed` vs `awk`.
12. **Comparing text and trees** — `diff`, unified diff, `patch`, directory diffs.
13. **Archives** — `tar` create/extract, compression, permissions preserved on extract.
14. **Compression tools** — `gzip`, `zip`, `zstd` (optional install).
15. **Users, groups, permissions** — `id`, `chmod`, `chown`, `umask`; ACL overview (Linux).
16. **Services (Linux)** — `systemctl` inspect-only patterns; journal pointers.
17. **Scheduling** — `crontab`; macOS `launchctl` contrast.
18. **System introspection** — `lsof`, `strace`/`dtrace`, `ss`/`netstat`, disk and mount tools.
19. **HTTP with `curl`** — methods, headers, cookies, TLS verify, output and retries.
20. **Downloads with `wget`** — mirroring, differences vs `curl`, when `wget` is absent (macOS).
21. **`ssh`, keys, and agents** — config file, `ProxyJump`, `scp`, batch `sftp`.
22. **`rsync` for sync** — filters, trailing slashes, delete modes (lab-only warnings).
23. **DNS CLI** — `dig`, `host`, `nslookup`, tracing resolution issues.
24. **Reachability** — `ping`/`traceroute`/`mtr`, interpreting loss vs routing changes.
25. **`whois` and registration data** — throttling, responsible use.
26. **TLS with `openssl`** — inspect certs, test handshakes against **local** services.
27. **`nc` and `socat`** — listeners and clients on localhost; variant flags (BSD vs OpenBSD `nc`).
28. **`tcpdump` fundamentals** — BPF basics, writing pcaps, **interface choice** (lab).
29. **`tshark` / decode workflows** — filters, follow TCP stream, export objects.
30. **Live log tailing** — `tail`, `less`, `journalctl`, multi-file correlation.
31. **`jq` for JSON** — select, map, slurp, merging shell + `jq` safely.
32. **`yq` for YAML** — parser flavor documented; Kubernetes manifests as optional fixtures.
33. **Parallelism** — `xargs` concurrency, `parallel` (GNU) quoting rules; backpressure and errors.
34. **Shell scripting structure** — functions, `trap`, logging, `shellcheck` as gate.
35. **`nmap` essentials** — discovery vs version scan; timing; **authorization** boilerplate in every file.
36. **Web content discovery** — one primary tool (`ffuf` or `gobuster` or `dirb`) + wordlists; local lab targets only.
37. **Wordlist generation** — `cewl` against **local** site clone or allowed scope.
38. **Online brute-force tools** — `hydra` (or equivalent) against **local lab** credentials table; theory for real engagements.
39. **Optional: high-speed scanning** — `masscan` in isolated VM; caps and legal banner.
40. **Containers for labs** — `docker`/`podman` compose for vulnerable app + capture sidecar (optional capstone).
41. **Capstone: macOS vs Linux delta map** — single module linking back to platform notes from topics 1–40.

---

## Empty checklist (printable)

Use as a progress tracker; tick when all four files + `data/` exist for the slug.

| # | Slug (fill in) | `summary` | `assignment` | `solution` | `answers` | `data/` |
|---|----------------|-----------|----------------|------------|-----------|---------|
| 1 | | ☐ | ☐ | ☐ | ☐ | ☐ |
| 2 | | ☐ | ☐ | ☐ | ☐ | ☐ |
| 41 | | ☐ | ☐ | ☐ | ☐ | ☐ |

Duplicate the middle row for topics **3–40** (one row per numbered topic above). If you split or merge topics, renumber deliberately and update cross-links.
