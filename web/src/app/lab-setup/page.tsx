import { CopyCodeBlock } from "@/components/CopyCodeBlock";
import { LabTable } from "@/components/LabTable";
import { PageHeader } from "@/components/PageHeader";
import { GITHUB_REPO } from "@/lib/constants";
import { lab } from "@/ui/lab";

const NETWORK_HOSTS: [ip: string, host: string, purpose: string][] = [
  [
    "10.78.8.10",
    "client",
    "SSH entry point; learner host with exercise fixtures and Apache logs",
  ],
  [
    "10.78.8.11",
    "lan-client",
    "Simulates background user traffic (cron HTTP requests to webserver every 5 min)",
  ],
  [
    "10.78.8.20",
    "webserver",
    "PHP site, REST API, login, PostgreSQL integration",
  ],
  ["10.78.8.30", "db", "PostgreSQL — database for webserver exercises"],
  ["10.78.8.40", "exchange-ftp", "FTP service for file-transfer exercises"],
  [
    "10.78.8.41",
    "exchange-smtp",
    "SMTP / Mailpit — email exercises; web UI at http://127.0.0.1:8025",
  ],
  [
    "10.78.8.50",
    "forensics-box",
    "Forensics analysis host for incident response and triage exercises",
  ],
  [
    "10.78.8.2",
    "vpn",
    "WireGuard gateway — routes your machine into the 10.78.8.0/24 LAN",
  ],
];

function Code({ children }: { children: React.ReactNode }) {
  return <code className={lab.docCode}>{children}</code>;
}

function Cmd({ children }: { children: string }) {
  return (
    <CopyCodeBlock className="mt-3 overflow-x-auto rounded-md border border-zinc-800 bg-black/50 px-4 py-3 font-mono text-sm text-zinc-100">
      {children}
    </CopyCodeBlock>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={lab.docSection}>
      <h2 className={lab.heading2}>{title}</h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <h3 className={lab.heading3}>{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function LabSetupPage() {
  return (
    <div className={lab.content}>
      <PageHeader title="Lab setup">
        How to start the local Docker LAN, connect to the learner host, and set
        up WireGuard for direct IP access.
      </PageHeader>

      {/* ── Quick start ─────────────────────────────────────────── */}
      <Section id="quick-start" title="Quick start">
        <p className={lab.docBody}>
          All lab hosts are defined in <Code>lab/compose.yml</Code>. Start them
          from the repository root:
        </p>
        <Cmd>{`git clone ${GITHUB_REPO}
cd lab
docker compose up -d`}</Cmd>
        <p className={`mt-4 ${lab.docBody}`}>
          Then SSH in via the published port on your local machine:
        </p>
        <Cmd>ssh -p 2222 isopod@127.0.0.1</Cmd>
        <p className={`mt-3 ${lab.muted}`}>
          Credentials — user: <Code>isopod</Code> / password:{" "}
          <Code>isopod</Code>. Exercise fixtures are seeded under{" "}
          <Code>/home/isopod/labs</Code> inside the container.
        </p>
      </Section>

      {/* ── Network architecture ─────────────────────────────────── */}
      <Section title="Network architecture">
        <p className={lab.docBody}>
          Containers share a bridge network at <Code>10.78.8.0/24</Code>. Each
          host has a fixed IP and a role:
        </p>
        <LabTable className="mt-4">
          <thead>
            <tr>
              <th className={lab.tableTh}>IP</th>
              <th className={lab.tableTh}>Host</th>
              <th className={lab.tableTh}>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {NETWORK_HOSTS.map(([ip, host, purpose]) => (
              <tr key={ip}>
                <td className={`${lab.tableTd} font-mono text-sm`}>{ip}</td>
                <td className={`${lab.tableTd} font-mono text-sm`}>{host}</td>
                <td className={`${lab.tableTd} text-sm`}>{purpose}</td>
              </tr>
            ))}
          </tbody>
        </LabTable>
        <p className={`mt-4 ${lab.muted}`}>
          Ports published to your host machine: <Code>2222→22</Code> (SSH),{" "}
          <Code>8000→80</Code> (client Apache), <Code>8080→80</Code>{" "}
          (webserver), <Code>8025→8025</Code> (Mailpit), and{" "}
          <Code>51820/udp</Code> (WireGuard).
        </p>
      </Section>

      {/* ── WireGuard ────────────────────────────────────────────── */}
      <Section id="wireguard" title="WireGuard — direct LAN access">
        <p className={lab.docBody}>
          On Linux the Docker bridge is directly reachable from the host, so you
          can <Code>ssh isopod@10.78.8.10</Code> without WireGuard. On{" "}
          <strong className="text-zinc-100">macOS and Windows</strong> Docker
          Desktop runs containers inside a hidden VM, so the{" "}
          <Code>10.78.8.0/24</Code> subnet is not accessible from your machine
          by default. The <Code>vpn</Code> container bridges that gap via
          WireGuard.
        </p>

        <SubSection title="1 — Extract the peer config">
          <p className={lab.docBody}>
            After <Code>docker compose up -d</Code>, the WireGuard container
            generates a peer config for the <Code>isopod</Code> peer and writes
            it to a named volume. Print it:
          </p>
          <Cmd>
            docker compose exec vpn cat /config/peer_isopod/peer_isopod.conf
          </Cmd>
          <p className={`mt-3 ${lab.docBody}`}>
            Or copy the file to your working directory:
          </p>
          <Cmd>docker compose cp vpn:/config/peer_isopod/peer_isopod.conf ./isopod.conf</Cmd>
          <p className={`mt-3 ${lab.muted}`}>
            The config contains a private key, the server endpoint, and the
            allowed IPs route (<Code>10.78.8.0/24</Code>). Keep it local — it
            grants LAN access.
          </p>
        </SubSection>

        <SubSection title="2 — Import and activate">
          <p className={lab.docBody}>
            Open the <strong className="text-zinc-100">WireGuard app</strong>{" "}
            (macOS: App Store; Windows: wireguard.com). Click{" "}
            <strong className="text-zinc-100">Import tunnel from file</strong>{" "}
            and select <Code>isopod.conf</Code>, or use the CLI:
          </p>
          <Cmd>{`# macOS (after installing wireguard-tools via Homebrew)
wg-quick up ./isopod.conf

# Windows (admin PowerShell)
& "C:\\Program Files\\WireGuard\\wireguard.exe" /installtunnelservice isopod.conf`}</Cmd>
          <p className={`mt-3 ${lab.muted}`}>
            Activate the tunnel in the app (toggle it on), or the{" "}
            <Code>wg-quick up</Code> command does it immediately. You only need
            to do this once per session — the tunnel stays up until you
            deactivate it.
          </p>
        </SubSection>

        <SubSection title="3 — Verify connectivity">
          <p className={lab.docBody}>
            With the tunnel active, the full LAN is reachable by IP:
          </p>
          <Cmd>{`ping 10.78.8.10
ssh isopod@10.78.8.10        # no port flag needed
curl http://10.78.8.20/      # webserver
curl http://10.78.8.20/api/  # REST API`}</Cmd>
        </SubSection>

        <SubSection title="Re-generating the config">
          <p className={lab.docBody}>
            If you rebuild the lab with <Code>docker compose down -v</Code> the
            WireGuard volume is wiped and a new key pair is generated on the
            next <Code>up</Code>. You will need to re-extract and re-import the
            config.
          </p>
        </SubSection>
      </Section>

      {/* ── SSH troubleshooting ──────────────────────────────────── */}
      <Section
        id="ssh-troubleshooting"
        title="Troubleshooting SSH on port 2222"
      >
        <p className={lab.docBody}>
          <Code>ssh -p 2222 isopod@127.0.0.1</Code> refusing the connection even
          when the containers appear to be running is one of the most common
          setup problems. Work through these checks in order.
        </p>

        <SubSection title="1 — Confirm the container is healthy">
          <Cmd>docker compose ps</Cmd>
          <p className={`mt-3 ${lab.docBody}`}>
            The <Code>client</Code> service must show <Code>running</Code> or{" "}
            <Code>Up</Code>, not <Code>restarting</Code> or <Code>exited</Code>.
            If it is not running, read the logs:
          </p>
          <Cmd>docker compose logs client</Cmd>
        </SubSection>

        <SubSection title="2 — Check what is actually listening on port 2222">
          <p className={lab.docBody}>
            The container may be running but the port binding may have failed
            silently (e.g. another process already held the port at compose-up
            time).
          </p>
          <Cmd>{`# macOS / Linux
lsof -i :2222

# Linux alternative
ss -tlnp | grep 2222

# Quick reachability test (exits 0 if something answers)
nc -zv 127.0.0.1 2222`}</Cmd>
          <p className={`mt-3 ${lab.muted}`}>
            If Docker (or <Code>com.docker</Code>) owns port 2222, the binding
            is correct — the problem is inside the container; continue to step
            3. If a <em className="text-zinc-300">different</em> process owns
            it, that process grabbed the port before Docker could — see step 4.
            If nothing appears, Docker never bound the port at all; re-check
            step 1 and look at <Code>docker compose logs client</Code> for
            startup errors.
          </p>
        </SubSection>

        <SubSection title="3 — Wait for sshd to finish starting">
          <p className={lab.docBody}>
            <Code>docker compose up -d</Code> returns as soon as the container
            process starts, not after the init system inside has finished
            launching <Code>sshd</Code>. On a cold build this can take a few
            seconds. Run:
          </p>
          <Cmd>docker compose exec client ps aux | grep sshd</Cmd>
          <p className={`mt-3 ${lab.docBody}`}>
            If <Code>sshd</Code> is absent, wait five seconds and try again. If
            it never appears, the Dockerfile entrypoint may have failed:
          </p>
          <Cmd>docker compose logs --tail 50 client</Cmd>
        </SubSection>

        <SubSection title="4 — Port conflict — another process grabbed 2222 first">
          <p className={lab.docBody}>
            Find and kill the conflicting process, then re-create the container
            so Docker can bind the port:
          </p>
          <Cmd>{`# Find the PID holding port 2222
lsof -ti :2222

# Kill it (replace <PID>)
kill <PID>

# Re-create the client container
docker compose up -d --force-recreate client`}</Cmd>
          <p className={`mt-3 ${lab.muted}`}>
            Common culprits: a previous container that was not fully stopped, a
            local SSH proxy, or another lab stack. Running{" "}
            <Code>docker compose down</Code> before <Code>up -d</Code> avoids
            this.
          </p>
        </SubSection>

        <SubSection title="5 — Stale SSH host-key warning">
          <p className={lab.docBody}>
            If you previously connected and then rebuilt the lab volumes, the
            host key changes and SSH refuses with a{" "}
            <em className="text-zinc-300">
              REMOTE HOST IDENTIFICATION HAS CHANGED
            </em>{" "}
            error. Clear the stale entry:
          </p>
          <Cmd>{'ssh-keygen -R "[127.0.0.1]:2222"'}</Cmd>
          <p className={`mt-3 ${lab.muted}`}>
            Then reconnect — SSH will prompt you to accept the new fingerprint.
          </p>
        </SubSection>

        <SubSection title="6 — macOS / Windows: Docker Desktop not running">
          <p className={lab.docBody}>
            Docker Desktop must be running (macOS menu bar / Windows system
            tray) for port forwarding to work. If you started the containers in a previous
            session and Docker Desktop was restarted since then, the port
            mappings may have been dropped. Bring everything back up:
          </p>
          <Cmd>{`docker compose down
docker compose up -d`}</Cmd>
        </SubSection>
      </Section>

      {/* ── Services ─────────────────────────────────────────────── */}
      <Section title="Published services">
        <p className={lab.docBody}>
          These ports are forwarded to <Code>127.0.0.1</Code> on your host while
          the lab is running:
        </p>
        <ul className={lab.docList}>
          <li>
            <Code>ssh -p 2222 isopod@127.0.0.1</Code> — learner shell
          </li>
          <li>
            <Code>curl http://127.0.0.1:8000/</Code> — client Apache
          </li>
          <li>
            <Code>curl http://127.0.0.1:8080/</Code> — webserver API
          </li>
          <li>
            <Code>http://127.0.0.1:8025/</Code> — Mailpit web UI
          </li>
          <li>
            <Code>51820/udp</Code> — WireGuard (see above)
          </li>
        </ul>
      </Section>

      {/* ── Teardown ─────────────────────────────────────────────── */}
      <Section title="Teardown">
        <p className={lab.docBody}>
          Stop and remove all containers without deleting data volumes:
        </p>
        <Cmd>docker compose down</Cmd>
        <p className={`mt-4 ${lab.docBody}`}>
          Full reset — stop containers <em className="italic">and</em> wipe all
          volumes (database, WireGuard keys, exercise data):
        </p>
        <Cmd>docker compose down -v</Cmd>
        <p className={`mt-3 ${lab.muted}`}>
          After <Code>down -v</Code> the next <Code>up -d</Code> rebuilds from
          scratch: fresh database seed, new WireGuard key pair (re-import the
          peer config), and clean exercise fixtures.
        </p>
      </Section>
    </div>
  );
}
