# Shell — project overview (for humans and coding agents)

## Purpose

Curriculum-style shell exercises: refresh knowledge, close skill gaps, and stay sharp on CLI workflows common in software engineering, systems administration, and security work. Content is **exercise-first** and **locally runnable**; theory stays in `summary.md` per module, not in this file.

## Goals

- Build a **sequential, numbered** module tree (see `structure.md` and `syllabus.md`) that a user can walk in order.
- Prefer **realistic tasks** (log triage, service debugging, HTTP inspection, packet capture on a lab interface) over toy one-liners.
- Document **Linux vs macOS** differences where built-in tools or flags diverge; prefer portable patterns when reasonable.

## Non-goals

- Teaching basic file listing or copy/move as standalone modules (those may appear only as supporting steps inside larger exercises).
- Instructions that require **testing against third-party networks without consent** or that normalize abuse of public infrastructure.

## Target audience

Software engineers, security engineers, system administrators, penetration testers.

## Prerequisites (assumed)

- Programming experience.
- Comfortable opening a terminal and running commands.
- User-level Linux familiarity (paths, permissions concepts).

## Environment assumptions

- Host is **Linux or macOS** with **full local control** (including `sudo` where exercises require it) and permission to install packages or VMs.
- For HTTP, auth, brute-force, or web-oriented security drills: **prepare a local web app** (or static site) served over HTTP/HTTPS on localhost or a lab-only IP; agents should scaffold or reference that setup in module `data/` or a shared `lab/` recipe, not point learners at arbitrary internet hosts.

## Agent / author operating rules

When creating or extending a module, follow all of the below unless the module explicitly documents an exception.

1. **Numbered directories** — e.g. `01-find-basics/`, so order is obvious in the filesystem.
2. **Per-module files** (minimum set):
   - `summary.md` — tight overview and theory; no bloat.
   - `assignment.md` — numbered exercises; later items may depend on earlier ones.
   - `solution.md` — explained solutions; show **multiple valid approaches** when they exist (e.g. `awk` vs `sed`, `find` vs pipelines) and briefly compare trade-offs.
   - `answers.md` — **only** the answers (no prose), keyed to assignment numbering.
   - `data/` — fixtures (sample logs, configs, binaries-as-data, etc.).
3. **CTF-style goals** where it helps retention: hidden strings, flags, IPs, or script outputs as the “answer”; flag format is flexible.
4. **Interactive / infra-heavy topics** (e.g. full `ssh`/`ftp` flows): if hands-on execution is awkward, include a **theory + walkthrough** section and still ship `assignment.md` with local or simulated equivalents where possible.
5. **Networking drills** — prefer **localhost lab**, **user-controlled VMs**, or **explicitly allowed** public endpoints; never frame scanning or fuzzing against arbitrary third parties as acceptable practice.
6. **Operational risk** — call out when a command pattern could look **suspicious on corporate networks** or in EDR telemetry (e.g. reverse shells, aggressive `nmap`, mass `curl`).
7. **Legal / ethical** — if a tool is only meaningful with **authorization**, split into: (a) local lab exercise, and/or (b) **theoretical** section stating consent and scope.

## Cross-references

- **Topic inventory and tiers** — `structure.md`
- **Ordered syllabus template** — `syllabus.md` (copy and fill per module as the repo grows)
