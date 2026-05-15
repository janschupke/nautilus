import type { LabTopic } from "@/lib/types";

type LabJsonTopic = { default: LabTopic };

/**
 * Register lab JSON here when adding a topic. Sidebar + routing use this map
 * automatically (`topicHasInteractiveContent` re-exports `hasLabTopic`).
 */
const labTopicLoaders = {
  // linux-fundamentals
  "01-kernel": () => import("./topics/linux-fundamentals/01-kernel.json"),
  "02-boot": () => import("./topics/linux-fundamentals/02-boot.json"),
  "03-filesystem": () =>
    import("./topics/linux-fundamentals/03-filesystem.json"),
  "04-processes": () => import("./topics/linux-fundamentals/04-processes.json"),
  "05-permissions": () =>
    import("./topics/linux-fundamentals/05-permissions.json"),
  "06-io": () => import("./topics/linux-fundamentals/06-io.json"),
  "07-packages": () => import("./topics/linux-fundamentals/07-packages.json"),
  // basics
  "01-environment": () => import("./topics/basics/01-environment.json"),
  "02-file-hex": () => import("./topics/basics/02-file-hex.json"),
  "03-cut-tr": () => import("./topics/basics/03-cut-tr.json"),
  "04-sed": () => import("./topics/basics/04-sed.json"),
  "05-awk": () => import("./topics/basics/05-awk.json"),
  "06-sort": () => import("./topics/basics/06-sort.json"),
  "07-grep": () => import("./topics/basics/07-grep.json"),
  "08-grep": () => import("./topics/basics/08-grep.json"),
  "09-logs": () => import("./topics/basics/09-logs.json"),
  "10-jq": () => import("./topics/basics/10-jq.json"),
  "11-yq": () => import("./topics/basics/11-yq.json"),
  "12-xargs": () => import("./topics/basics/12-xargs.json"),
  "13-scripts": () => import("./topics/basics/13-scripts.json"),
  // filesystem
  "01-find": () => import("./topics/filesystem/01-find.json"),
  "02-fhs": () => import("./topics/filesystem/02-fhs.json"),
  "03-diff": () => import("./topics/filesystem/03-diff.json"),
  "04-tar": () => import("./topics/filesystem/04-tar.json"),
  "05-gzip": () => import("./topics/filesystem/05-gzip.json"),
  // processes-and-users
  "01-ps": () => import("./topics/processes-and-users/01-ps.json"),
  "02-chmod": () => import("./topics/processes-and-users/02-chmod.json"),
  "03-systemd": () => import("./topics/processes-and-users/03-systemd.json"),
  "04-cron": () => import("./topics/processes-and-users/04-cron.json"),
  "05-ss": () => import("./topics/processes-and-users/05-ss.json"),
  // net-theory
  "01-ports": () => import("./topics/net-theory/01-ports.json"),
  "02-addressing": () => import("./topics/net-theory/02-addressing.json"),
  "03-tcp-udp": () => import("./topics/net-theory/03-tcp-udp.json"),
  "04-dns-theory": () => import("./topics/net-theory/04-dns-theory.json"),
  "05-routing": () => import("./topics/net-theory/05-routing.json"),
  "06-app-protocols": () => import("./topics/net-theory/06-app-protocols.json"),
  "07-ipsec": () => import("./topics/net-theory/07-ipsec.json"),
  // networking
  "01-ip-local": () => import("./topics/networking/01-ip-local.json"),
  "02-curl": () => import("./topics/networking/02-curl.json"),
  "03-wget": () => import("./topics/networking/03-wget.json"),
  "04-ssh": () => import("./topics/networking/04-ssh.json"),
  "05-rsync": () => import("./topics/networking/05-rsync.json"),
  "06-dns": () => import("./topics/networking/06-dns.json"),
  "07-ping": () => import("./topics/networking/07-ping.json"),
  "08-whois": () => import("./topics/networking/08-whois.json"),
  "09-openssl": () => import("./topics/networking/09-openssl.json"),
  "10-nc": () => import("./topics/networking/10-nc.json"),
  "11-tcpdump": () => import("./topics/networking/11-tcpdump.json"),
  "12-tshark": () => import("./topics/networking/12-tshark.json"),
  // exploitation
  "01-nmap": () => import("./topics/exploitation/01-nmap.json"),
  "02-ffuf": () => import("./topics/exploitation/02-ffuf.json"),
  "03-wordlists": () => import("./topics/exploitation/03-wordlists.json"),
  "04-hydra": () => import("./topics/exploitation/04-hydra.json"),
  "05-masscan": () => import("./topics/exploitation/05-masscan.json"),
  // forensics
  "01-artifacts": () => import("./topics/forensics/01-artifacts.json"),
  "02-logs": () => import("./topics/forensics/02-logs.json"),
  "03-triage": () => import("./topics/forensics/03-triage.json"),
} as const satisfies Record<string, () => Promise<LabJsonTopic>>;

type RegisteredId = keyof typeof labTopicLoaders;

const LOADERS_BY_ID: Record<string, () => Promise<LabJsonTopic>> =
  labTopicLoaders;

/** Topic ids that have a JSON bundle under `src/content/topics/`. */
export const REGISTERED_LAB_TOPIC_IDS: readonly string[] = (
  Object.keys(labTopicLoaders) as RegisteredId[]
).sort();

export function hasLabTopic(id: string): id is RegisteredId {
  return id in labTopicLoaders;
}

export async function getLabTopic(id: string): Promise<LabTopic | null> {
  const load = LOADERS_BY_ID[id];
  if (!load) return null;
  const mod = await load();
  return mod.default;
}
