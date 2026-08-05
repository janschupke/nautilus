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
    <nav aria-label="Breadcrumb" className={`mb-6 ${lab.muted}`}>
      <ol className="flex flex-wrap items-center">
        <li>
          <Link
            href={parent.href}
            className={`rounded-sm hover:text-zinc-200 ${lab.focusRing}`}
          >
            {parent.label}
          </Link>
        </li>
        <li>
          <span className="mx-2 text-fg-faint" aria-hidden="true">
            /
          </span>
          <span
            aria-current="page"
            className={`text-zinc-300${mono ? " font-mono" : ""}`}
          >
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
