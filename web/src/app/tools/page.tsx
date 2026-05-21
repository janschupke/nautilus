import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Tools" };
import { NavCardList, type NavCardItem } from "@/components/NavCardList";
import { lab } from "@/ui/lab";

const TOOLS: NavCardItem[] = [
  {
    href: "/tools/subnetting",
    title: "Subnetting calculator",
    description:
      "Break down an IP address and prefix length into network address, broadcast, usable host range, and more.",
  },
  {
    href: "/tools/json",
    title: "JSON formatter",
    description:
      "Prettify or minify JSON, validate syntax, and inspect parse errors with line and column info.",
  },
  {
    href: "/tools/dh",
    title: "Diffie-Hellman calculator",
    description:
      "Compute public keys and shared secrets from DH parameters. Enter any known values and derive the rest.",
  },
];

export default function ToolsPage() {
  return (
    <div className={lab.content}>
      <PageHeader title="Tools">
        Reference utilities for networking and security work.
      </PageHeader>
      <NavCardList items={TOOLS} />
    </div>
  );
}
