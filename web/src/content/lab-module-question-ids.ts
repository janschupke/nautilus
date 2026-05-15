import type { LabTopic } from "@/lib/types";

// linux-fundamentals
import m_lf_01 from "./topics/linux-fundamentals/01-kernel.json";
import m_lf_02 from "./topics/linux-fundamentals/02-boot.json";
import m_lf_03 from "./topics/linux-fundamentals/03-filesystem.json";
import m_lf_04 from "./topics/linux-fundamentals/04-processes.json";
import m_lf_05 from "./topics/linux-fundamentals/05-permissions.json";
import m_lf_06 from "./topics/linux-fundamentals/06-io.json";
import m_lf_07 from "./topics/linux-fundamentals/07-packages.json";
// basics
import m_basics_01 from "./topics/basics/01-environment.json";
import m_basics_02 from "./topics/basics/02-file-hex.json";
import m_basics_03 from "./topics/basics/03-cut-tr.json";
import m_basics_04 from "./topics/basics/04-sed.json";
import m_basics_05 from "./topics/basics/05-awk.json";
import m_basics_06 from "./topics/basics/06-sort.json";
import m_basics_07 from "./topics/basics/07-grep.json";
import m_basics_08 from "./topics/basics/08-grep.json";
import m_basics_09 from "./topics/basics/09-logs.json";
import m_basics_10 from "./topics/basics/10-jq.json";
import m_basics_11 from "./topics/basics/11-yq.json";
import m_basics_12 from "./topics/basics/12-xargs.json";
import m_basics_13 from "./topics/basics/13-scripts.json";
// filesystem
import m_fs_01 from "./topics/filesystem/01-find.json";
import m_fs_02 from "./topics/filesystem/02-fhs.json";
import m_fs_03 from "./topics/filesystem/03-diff.json";
import m_fs_04 from "./topics/filesystem/04-tar.json";
import m_fs_05 from "./topics/filesystem/05-gzip.json";
// processes-and-users
import m_proc_01 from "./topics/processes-and-users/01-ps.json";
import m_proc_02 from "./topics/processes-and-users/02-chmod.json";
import m_proc_03 from "./topics/processes-and-users/03-systemd.json";
import m_proc_04 from "./topics/processes-and-users/04-cron.json";
import m_proc_05 from "./topics/processes-and-users/05-ss.json";
// net-theory
import m_nt_01 from "./topics/net-theory/01-ports.json";
import m_nt_02 from "./topics/net-theory/02-addressing.json";
import m_nt_03 from "./topics/net-theory/03-tcp-udp.json";
import m_nt_04 from "./topics/net-theory/04-dns-theory.json";
import m_nt_05 from "./topics/net-theory/05-routing.json";
import m_nt_06 from "./topics/net-theory/06-app-protocols.json";
import m_nt_07 from "./topics/net-theory/07-ipsec.json";
// networking
import m_net_00 from "./topics/networking/01-ip-local.json";
import m_net_01 from "./topics/networking/02-curl.json";
import m_net_02 from "./topics/networking/03-wget.json";
import m_net_03 from "./topics/networking/04-ssh.json";
import m_net_04 from "./topics/networking/05-rsync.json";
import m_net_05 from "./topics/networking/06-dns.json";
import m_net_06 from "./topics/networking/07-ping.json";
import m_net_07 from "./topics/networking/08-whois.json";
import m_net_08 from "./topics/networking/09-openssl.json";
import m_net_09 from "./topics/networking/10-nc.json";
import m_net_10 from "./topics/networking/11-tcpdump.json";
import m_net_11 from "./topics/networking/12-tshark.json";
// exploitation
import m_ex_01 from "./topics/exploitation/01-nmap.json";
import m_ex_02 from "./topics/exploitation/02-ffuf.json";
import m_ex_03 from "./topics/exploitation/03-wordlists.json";
import m_ex_04 from "./topics/exploitation/04-hydra.json";
import m_ex_05 from "./topics/exploitation/05-masscan.json";
// forensics
import m_for_01 from "./topics/forensics/01-artifacts.json";
import m_for_02 from "./topics/forensics/02-logs.json";
import m_for_03 from "./topics/forensics/03-triage.json";

const REGISTERED_MODULES = [
  m_lf_01, m_lf_02, m_lf_03, m_lf_04, m_lf_05, m_lf_06, m_lf_07,
  m_basics_01,
  m_basics_02,
  m_basics_03,
  m_basics_04,
  m_basics_05,
  m_basics_06,
  m_basics_07,
  m_basics_08,
  m_basics_09,
  m_basics_10,
  m_basics_11,
  m_basics_12,
  m_basics_13,
  m_fs_01,
  m_fs_02,
  m_fs_03,
  m_fs_04,
  m_fs_05,
  m_proc_01,
  m_proc_02,
  m_proc_03,
  m_proc_04,
  m_proc_05,
  m_nt_01, m_nt_02, m_nt_03, m_nt_04, m_nt_05, m_nt_06, m_nt_07,
  m_net_00,
  m_net_01,
  m_net_02,
  m_net_03,
  m_net_04,
  m_net_05,
  m_net_06,
  m_net_07,
  m_net_08,
  m_net_09,
  m_net_10,
  m_net_11,
  m_ex_01,
  m_ex_02,
  m_ex_03,
  m_ex_04,
  m_ex_05,
  m_for_01,
  m_for_02,
  m_for_03,
] as const satisfies readonly LabTopic[];

/** Question ids per lab topic id (sync mirror of bundled JSON). */
export const LAB_MODULE_QUESTION_IDS: Readonly<
  Record<string, readonly string[]>
> = Object.freeze(
  Object.fromEntries(
    REGISTERED_MODULES.map(
      (m) => [m.id, m.questions.map((q) => q.id)] as const,
    ),
  ),
);
