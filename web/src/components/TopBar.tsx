"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lab } from "@/ui/lab";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`${lab.btnGhost} ${active ? lab.btnGhostActive : ""}`}>
      {label}
    </Link>
  );
}

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className={lab.topBar}>
      <div className={lab.topBarActions}>
        <NavLink href="/"          label="Home"      active={pathname === "/"} />
        <NavLink href="/lab-setup" label="Lab setup" active={pathname === "/lab-setup"} />
        <NavLink href="/stats"     label="Stats"     active={pathname === "/stats"} />
        <NavLink href="/tools"     label="Tools"     active={pathname.startsWith("/tools")} />
        <NavLink href="/rtfm"      label="RTFM"      active={pathname.startsWith("/rtfm")} />
      </div>
    </header>
  );
}
