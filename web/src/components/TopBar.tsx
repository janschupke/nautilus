"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import nautilusIcon from "@/app/icon.png";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { SIDEBAR_ID } from "@/components/ModuleSidebar";
import { lab } from "@/ui/lab";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${lab.btnGhost} ${active ? lab.btnGhostActive : ""}`}
    >
      {label}
    </Link>
  );
}

type TopBarProps = {
  sidebarOpen: boolean;
  onMenuToggle: () => void;
};

export function TopBar({ sidebarOpen, onMenuToggle }: TopBarProps) {
  const pathname = usePathname();

  return (
    <header className={lab.topBar}>
      <button
        type="button"
        aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={sidebarOpen}
        aria-controls={SIDEBAR_ID}
        onClick={onMenuToggle}
        className={`${lab.iconButton} md:hidden`}
      >
        <Menu size={20} />
      </button>
      <Link
        href="/"
        className={`ml-3 mr-auto rounded-md md:hidden ${lab.focusRing}`}
      >
        <Image
          src={nautilusIcon}
          alt="Nautilus home"
          width={46}
          height={32}
          className="opacity-80"
        />
      </Link>
      <nav
        aria-label="Primary"
        className={`${lab.topBarActions} hidden md:flex`}
      >
        <NavLink href="/" label="Home" active={pathname === "/"} />
        <NavLink
          href="/lab-setup"
          label="Lab setup"
          active={pathname === "/lab-setup"}
        />
        <NavLink href="/stats" label="Stats" active={pathname === "/stats"} />
        <NavLink
          href="/tools"
          label="Tools"
          active={pathname.startsWith("/tools")}
        />
        <NavLink
          href="/rtfm"
          label="RTFM"
          active={pathname.startsWith("/rtfm")}
        />
      </nav>
      <div className="ml-2 flex shrink-0 items-center">
        <KeyboardShortcuts />
      </div>
    </header>
  );
}
