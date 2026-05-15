import { PageHeader } from "@/components/PageHeader";
import { GITHUB_REPO } from "@/lib/constants";
import { lab } from "@/ui/lab";

export default function HomePage() {
  return (
    <div className={lab.content}>
      <PageHeader title="Nautilus">
        Pick a topic in the sidebar, start the Docker lab, SSH in.
      </PageHeader>

      <section className={lab.docSection}>
        <h2 className={lab.heading2}>Purpose</h2>
        <p className={lab.docBody}>
          Hands-on shell practice across Linux, networking, and security tooling.
          Not a course — no walkthroughs, minimal explanation. Assumes everyday
          CLI familiarity. Serves as a way to identify knowledge gaps and RTFM, rather than providing detailed instruction.
        </p>
      </section>

      <section className={lab.docSection}>
        <h2 className={lab.heading2}>Disclaimers</h2>
        <ul className={lab.docList}>
          <li>Don't do illegal things or the shrimps will find and fight you. Running some of the networking tools presented on this site against public infrastructure without consent might get you in trouble. 🦐 🚔</li>
          <li>
            This site has been vibe hacked together for my own practice as a side project, and while content has been verified as well as my skills allow, there might be broken things or imprecisions. PRs with fixes and new content are welcome at{" "}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={lab.linkExternal}
            >
              {GITHUB_REPO}
            </a>
          </li>
        </ul>
      </section>

      <section className={lab.docSection}>
        <h2 className={lab.heading2}>Prerequisites</h2>
        <p className={lab.docBody}>
          Linux CLI, Git, SSH, Docker, basic networking.
        </p>
      </section>

      <section className={lab.docSection}>
        <h2 className={lab.heading2}>Coverage</h2>
        <ul className={lab.docList}>
          <li>Linux fundamentals — kernel, boot, filesystem, permissions, I/O, packages</li>
          <li>
            Shell basics — environment, binary inspection,{" "}
            <code className={lab.docCode}>cut</code>,{" "}
            <code className={lab.docCode}>sed</code>,{" "}
            <code className={lab.docCode}>awk</code>,{" "}
            <code className={lab.docCode}>sort</code>,{" "}
            <code className={lab.docCode}>grep</code>,{" "}
            <code className={lab.docCode}>jq</code>,{" "}
            <code className={lab.docCode}>yq</code>, logs, parallelism, scripting
          </li>
          <li>
            Filesystem —{" "}
            <code className={lab.docCode}>find</code>, FHS,{" "}
            <code className={lab.docCode}>diff</code>, archives, compression
          </li>
          <li>
            Processes and users — signals, permissions,{" "}
            <code className={lab.docCode}>systemd</code>,{" "}
            <code className={lab.docCode}>cron</code>, introspection
          </li>
          <li>Networking theory — addressing, ports, TCP/UDP, DNS, routing, protocols</li>
          <li>
            Networking —{" "}
            <code className={lab.docCode}>curl</code>,{" "}
            <code className={lab.docCode}>wget</code>, SSH,{" "}
            <code className={lab.docCode}>rsync</code>, DNS,{" "}
            <code className={lab.docCode}>ping</code>,{" "}
            <code className={lab.docCode}>whois</code>, TLS,{" "}
            <code className={lab.docCode}>netcat</code>,{" "}
            <code className={lab.docCode}>tcpdump</code>,{" "}
            <code className={lab.docCode}>tshark</code>
          </li>
          <li>
            Exploitation —{" "}
            <code className={lab.docCode}>nmap</code>,{" "}
            <code className={lab.docCode}>ffuf</code>, wordlists,{" "}
            <code className={lab.docCode}>hydra</code>,{" "}
            <code className={lab.docCode}>masscan</code>
          </li>
          <li>Forensics — artifact analysis, log investigation, host triage</li>
        </ul>
      </section>
    </div>
  );
}
