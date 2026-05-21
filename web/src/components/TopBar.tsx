"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import nautilusIcon from "@/app/icon.png";
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
      className={`${lab.btnGhost} ${active ? lab.btnGhostActive : ""}`}
    >
      {label}
    </Link>
  );
}

type TopBarProps = {
  onMenuToggle: () => void;
};

export function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();

  return (
    <header className={lab.topBar}>
      <button
        type="button"
        aria-label="Toggle menu"
        onClick={onMenuToggle}
        className="rounded-md p-2 text-fg-faint hover:bg-surface-raised hover:text-fg-soft md:hidden"
      >
        <Menu size={20} />
      </button>
      <Link href="/" className="mr-auto md:hidden">
        <Image src={nautilusIcon} alt="Nautilus" width={32} height={32} className="opacity-80" />
      </Link>
      <div className={`${lab.topBarActions} hidden md:flex`}>
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
      </div>
    </header>
  );
}
