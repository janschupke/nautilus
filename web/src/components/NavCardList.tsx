import Link from "next/link";
import { lab } from "@/ui/lab";

export type NavCardItem = {
  href: string;
  title: string;
  description: string;
};

type NavCardListProps = {
  items: readonly NavCardItem[];
  /** Render each title in monospace (e.g. for cheatsheet/tool names). */
  mono?: boolean;
};

/** Vertical list of navigable link cards, one per item. */
export function NavCardList({ items, mono = false }: NavCardListProps) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={`${lab.panel} ${lab.panelLink}`}>
            {/* A real heading, so the card list is navigable by heading. */}
            <h2 className={`${lab.heading3}${mono ? " font-mono" : ""}`}>
              {item.title}
            </h2>
            <p className={`mt-1 ${lab.muted}`}>{item.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
