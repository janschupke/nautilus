import Link from "next/link";
import { lab } from "@/ui/lab";

type BreadcrumbProps = {
  parent: { href: string; label: string };
  current: string;
  /** Render the current page label in monospace — use for command/tool names. */
  mono?: boolean;
};

export function Breadcrumb({ parent, current, mono = false }: BreadcrumbProps) {
  return (
    <nav className={`mb-6 ${lab.muted}`}>
      <Link href={parent.href} className="hover:text-zinc-200">
        {parent.label}
      </Link>
      <span className="mx-2 text-zinc-600">/</span>
      <span className={`text-zinc-300${mono ? " font-mono" : ""}`}>
        {current}
      </span>
    </nav>
  );
}
