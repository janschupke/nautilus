export const ALL_TOPIC_IDS = [
  // linux-fundamentals
  "01-kernel",
  "02-boot",
  "03-filesystem",
  "04-processes",
  "05-permissions",
  "06-io",
  "07-packages",
  // basics
  "01-environment",
  "02-file-hex",
  "03-cut-tr",
  "04-sed",
  "05-awk",
  "06-sort",
  "07-grep",
  "08-grep",
  "09-logs",
  "10-jq",
  "11-yq",
  "12-xargs",
  "13-scripts",
  // filesystem
  "01-find",
  "02-fhs",
  "03-diff",
  "04-tar",
  "05-gzip",
  // processes-and-users
  "01-ps",
  "02-chmod",
  "03-systemd",
  "04-cron",
  "05-ss",
  // net-theory
  "01-ports",
  "02-addressing",
  "03-tcp-udp",
  "04-dns-theory",
  "05-routing",
  "06-app-protocols",
  "07-ipsec",
  // networking
  "01-ip-local",
  "02-curl",
  "03-wget",
  "04-ssh",
  "05-rsync",
  "06-dns",
  "07-ping",
  "08-whois",
  "09-openssl",
  "10-nc",
  "11-tcpdump",
  "12-tshark",
  // exploitation
  "01-nmap",
  "02-ffuf",
  "03-wordlists",
  "04-hydra",
  "05-masscan",
  // forensics
  "01-artifacts",
  "02-logs",
  "03-triage",
] as const;

export type TopicId = (typeof ALL_TOPIC_IDS)[number];

export {
  hasLabTopic as topicHasInteractiveContent,
  REGISTERED_LAB_TOPIC_IDS,
} from "./lab-modules";

export type TopicEntry = { id: string; label: string };
type ModuleDef = { id: string; title: string; topics: readonly TopicEntry[] };

function t(id: string, label: string): TopicEntry {
  return { id, label };
}

function chunkModule(
  id: string,
  title: string,
  topics: readonly TopicEntry[],
): ModuleDef {
  return { id, title, topics };
}

export const MANIFEST = {
  modules: [
    chunkModule("linux-fundamentals", "Linux Fundamentals", [
      t("01-kernel", "01 — Linux kernel and architecture"),
      t("02-boot", "02 — Linux boot process"),
      t("03-filesystem", "03 — Filesystem concepts"),
      t("04-processes", "04 — Linux process model"),
      t("05-permissions", "05 — Users, groups, and permissions"),
      t("06-io", "06 — I/O, file descriptors, and streams"),
      t("07-packages", "07 — Package management"),
    ]),
    chunkModule("basics", "Shell Basics", [
      t("01-environment", "01 — Shell environment and safe defaults"),
      t("02-file-hex", "02 — Inspecting unknown content"),
      t("03-cut-tr", "03 — Text extraction and reshaping"),
      t("04-sed", "04 — sed for streaming edits"),
      t("05-awk", "05 — awk for fields and reports"),
      t("06-sort", "06 — Sorting and deduplication"),
      t("07-grep", "07 — Search basics (grep and ripgrep)"),
      t("08-grep", "08 — Advanced grep, ripgrep, and regex"),
      t("09-logs", "09 — Live log tailing"),
      t("10-jq", "10 — jq for JSON"),
      t("11-yq", "11 — yq for YAML"),
      t("12-xargs", "12 — Parallelism (xargs, parallel)"),
      t("13-scripts", "13 — Shell scripting structure"),
    ]),
    chunkModule("filesystem", "Filesystem", [
      t("01-find", "01 — Finding files and metadata"),
      t("02-fhs", "02 — Filesystem literacy"),
      t("03-diff", "03 — Comparing text and trees (diff / patch)"),
      t("04-tar", "04 — Archives (tar)"),
      t("05-gzip", "05 — Compression tools"),
    ]),
    chunkModule("processes-and-users", "Processes & Users", [
      t("01-ps", "01 — Process listing and signals"),
      t("02-chmod", "02 — Users, groups, permissions"),
      t("03-systemd", "03 — Services (Linux, systemd)"),
      t("04-cron", "04 — Scheduling: cron, crontab, launchd"),
      t("05-ss", "05 — System introspection"),
    ]),
    chunkModule("net-theory", "Networking Theory", [
      t("01-ports", "01 — Well-known ports"),
      t("02-addressing", "02 — IP addressing and special ranges"),
      t("03-tcp-udp", "03 — TCP and UDP fundamentals"),
      t("04-dns-theory", "04 — DNS record types and resolution"),
      t("05-routing", "05 — IP routing fundamentals"),
      t("06-app-protocols", "06 — Application-layer protocols"),
      t("07-ipsec", "07 — IPsec and VPN concepts"),
    ]),
    chunkModule("networking", "Networking", [
      t("01-ip-local", "01 — Local interfaces, routing, and ARP"),
      t("02-curl", "02 — HTTP with curl"),
      t("03-wget", "03 — Downloads with wget"),
      t("04-ssh", "04 — SSH config, keys, and agents"),
      t("05-rsync", "05 — rsync for sync"),
      t("06-dns", "06 — DNS CLI (dig, host, nslookup)"),
      t("07-ping", "07 — Reachability: ping, traceroute, mtr"),
      t("08-whois", "08 — WHOIS-style text and registration fields"),
      t("09-openssl", "09 — TLS with openssl"),
      t("10-nc", "10 — netcat / nc and socat"),
      t("11-tcpdump", "11 — tcpdump BPF basics and text output"),
      t("12-tshark", "12 — tshark decode workflows"),
    ]),
    chunkModule("exploitation", "Exploitation", [
      t("01-nmap", "01 — nmap essentials"),
      t("02-ffuf", "02 — Web content discovery"),
      t("03-wordlists", "03 — CEWL-style wordlists"),
      t("04-hydra", "04 — Online brute-force tools"),
      t("05-masscan", "05 — High-speed scanning (masscan)"),
    ]),
    chunkModule("forensics", "Forensics", [
      t("01-artifacts", "01 — Suspicious file analysis"),
      t("02-logs", "02 — Web server log forensics"),
      t("03-triage", "03 — Compromised host triage"),
    ]),
  ] satisfies readonly ModuleDef[],
};

/** Set of all valid module ids — used by routing helpers. */
export const MODULE_IDS: ReadonlySet<string> = new Set(
  MANIFEST.modules.map((m) => m.id),
);

/** Module def for `moduleId`, or `null` if not in the manifest. */
export function findModule(moduleId: string): ModuleDef | null {
  return MANIFEST.modules.find((m) => m.id === moduleId) ?? null;
}

/** Module id containing `topicId`, or `null` if not listed. */
export function findModuleIdForTopic(topicId: string): string | null {
  for (const mod of MANIFEST.modules) {
    if (mod.topics.some((t) => t.id === topicId)) return mod.id;
  }
  return null;
}

/** Display label for `topicId` from the manifest, or a fallback derived from the id. */
export function labelFromTopicId(topicId: string): string {
  for (const mod of MANIFEST.modules) {
    const entry = mod.topics.find((t) => t.id === topicId);
    if (entry) return entry.label;
  }
  const parts = topicId.split("-");
  return `${parts[0] ?? topicId} — ${parts.slice(1).join(" ")}`;
}
