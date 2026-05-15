"use client";

import { usePathname, useRouter } from "next/navigation";
import { MANIFEST } from "@/content/manifest";
import { useHotkeys } from "@/hooks/use-hotkeys";
import {
  moduleIdFromPathname,
  topicRouteFromPathname,
} from "@/lib/module-pathname";

type NavItem =
  | { kind: "module"; moduleId: string; href: string }
  | { kind: "topic"; moduleId: string; topicId: string; href: string };

// Flat ordered list: module summary page, then all its topics, repeat.
const FLAT_NAV: NavItem[] = MANIFEST.modules.flatMap((mod) => [
  { kind: "module", moduleId: mod.id, href: `/${mod.id}` },
  ...mod.topics.map((t) => ({
    kind: "topic" as const,
    moduleId: mod.id,
    topicId: t.id,
    href: `/${mod.id}/${t.id}`,
  })),
]);

export function NavHotkeys() {
  const router = useRouter();
  const pathname = usePathname();

  const modId = moduleIdFromPathname(pathname);
  const route = topicRouteFromPathname(pathname);

  const curIdx = FLAT_NAV.findIndex((item) =>
    item.kind === "module"
      ? item.moduleId === modId
      : item.topicId === route?.topicId,
  );

  useHotkeys([
    // ── Letter shortcuts for top-bar pages ──────────────────────
    { key: "h", action: () => router.push("/") },
    { key: "l", action: () => router.push("/lab-setup") },
    { key: "s", action: () => router.push("/stats") },
    { key: "t", action: () => router.push("/tools") },
    { key: "r", action: () => router.push("/rtfm") },

    // ── j / + — forward through all nav items, wraps to first ───
    ...(["j", "+"] as const).map((key) => ({
      key,
      action: () => {
        const next =
          curIdx === -1 || curIdx === FLAT_NAV.length - 1 ? 0 : curIdx + 1;
        router.push(FLAT_NAV[next]!.href);
      },
    })),

    // ── k / - — backward through all nav items, wraps to last ───
    ...(["k", "-"] as const).map((key) => ({
      key,
      action: () => {
        const prev = curIdx <= 0 ? FLAT_NAV.length - 1 : curIdx - 1;
        router.push(FLAT_NAV[prev]!.href);
      },
    })),
  ]);

  return null;
}
