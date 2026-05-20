"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import nautilusLogo from "@/app/logo.png";
import {
  MANIFEST,
  findModuleIdForTopic,
  topicHasInteractiveContent,
} from "@/content/manifest";
import {
  DEFAULT_SIDEBAR_MODULES_SNAPSHOT,
  expandSidebarModule,
  parseSidebarModulesRaw,
  readSidebarModulesSnapshot,
  subscribeSidebarModules,
  toggleSidebarModuleCollapsed,
} from "@/lib/storage";
import { useLabProgressStore } from "@/hooks/use-lab-progress-store";
import { ModuleSidebarProgressRing } from "@/components/ModuleSidebarProgressRing";
import {
  getTopicLabProgressCounts,
  isTopicFullyCorrect,
  topicHasAnswerChecks,
} from "@/lib/module-completion";
import { formatModuleIndex } from "@/lib/format";
import {
  moduleIdFromPathname,
  topicRouteFromPathname,
} from "@/lib/module-pathname";
import { lab } from "@/ui/lab";

export function ModuleSidebar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const modulesRaw = useSyncExternalStore(
    subscribeSidebarModules,
    readSidebarModulesSnapshot,
    () => DEFAULT_SIDEBAR_MODULES_SNAPSHOT,
  );
  const collapsedIds = useMemo(
    () => new Set(parseSidebarModulesRaw(modulesRaw).collapsed),
    [modulesRaw],
  );
  const progress = useLabProgressStore();

  const activeTopicId = topicRouteFromPathname(pathname)?.topicId ?? null;
  // Used only for visual active state on the module heading link itself.
  const activeModulePageId = moduleIdFromPathname(pathname);

  useEffect(() => {
    if (!activeTopicId) return;
    const modId = findModuleIdForTopic(activeTopicId);
    if (modId) expandSidebarModule(modId);
  }, [activeTopicId]);

  // Pending scroll: set on route change, cleared once the element is found in the DOM.
  // Stored in refs (not state) so caret-only modulesRaw updates cannot arm them.
  const pendingScrollTopicRef = useRef<string | null>(null);
  const pendingScrollModuleRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeTopicId) {
      pendingScrollTopicRef.current = activeTopicId;
      pendingScrollModuleRef.current = null;
    } else if (activeModulePageId) {
      pendingScrollModuleRef.current = activeModulePageId;
      pendingScrollTopicRef.current = null;
    }
  }, [pathname, activeTopicId, activeModulePageId]);

  useEffect(() => {
    if (!navRef.current) return;
    const topicId = pendingScrollTopicRef.current;
    if (topicId) {
      const el = navRef.current.querySelector<HTMLElement>(
        `[data-sidebar-topic="${CSS.escape(topicId)}"]`,
      );
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        pendingScrollTopicRef.current = null;
      }
      return;
    }
    const moduleId = pendingScrollModuleRef.current;
    if (moduleId) {
      const el = navRef.current.querySelector<HTMLElement>(
        `[data-sidebar-module="${CSS.escape(moduleId)}"]`,
      );
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        pendingScrollModuleRef.current = null;
      }
    }
  }, [pathname, modulesRaw]);

  return (
    <aside className={lab.sidebar}>
      <div className={lab.sidebarHeader}>
        <Link href="/" className={lab.sidebarHomeLink}>
          <Image
            src={nautilusLogo}
            alt="Nautilus"
            width={320}
            height={80}
            className={lab.sidebarLogo}
            priority
          />
        </Link>
      </div>
      <nav ref={navRef} className="min-h-0 flex-1 overflow-y-auto p-2">
        {MANIFEST.modules.map((mod, modIndex) => {
          const collapsed = collapsedIds.has(mod.id);
          const moduleActive = activeModulePageId === mod.id;
          return (
            <div key={mod.id} className="mb-5">
              {/* Module header: caret toggle on left, link to summary on right */}
              <div
                className="flex w-full items-center rounded-md"
                data-sidebar-module={mod.id}
              >
                <button
                  type="button"
                  aria-label={collapsed ? "Expand module" : "Collapse module"}
                  aria-expanded={!collapsed}
                  onClick={() => toggleSidebarModuleCollapsed(mod.id)}
                  className="shrink-0 rounded-md px-2 py-1.5 text-fg-faint outline-none hover:bg-surface-raised hover:text-fg-soft focus-visible:ring-2 focus-visible:ring-accent-stroke/80"
                >
                  <span aria-hidden>{collapsed ? "▸" : "▾"}</span>
                </button>
                <Link
                  href={`/${mod.id}`}
                  className={`${lab.navCategoryToggle} flex-1 ${moduleActive ? lab.navCategoryActive : ""}`}
                >
                  <span className="min-w-0 flex-1">
                    {formatModuleIndex(modIndex)} — {mod.title}
                  </span>
                </Link>
              </div>

              {!collapsed ? (
                <ul className="space-y-1">
                  {mod.topics.map((topic) => {
                    const { id, label } = topic;
                    const href = `/${mod.id}/${id}`;
                    const active = activeTopicId === id;
                    const enabled = topicHasInteractiveContent(id);
                    const fullyCorrect =
                      enabled && isTopicFullyCorrect(progress, id);
                    const linkClass = active
                      ? fullyCorrect
                        ? lab.navLinkActiveComplete
                        : lab.navLinkActive
                      : fullyCorrect
                        ? lab.navLinkComplete
                        : lab.navLink;
                    const progressCounts = enabled
                      ? getTopicLabProgressCounts(progress, id)
                      : null;
                    const showProgressRing =
                      Boolean(progressCounts) &&
                      topicHasAnswerChecks(progress, id);
                    return (
                      <li key={id}>
                        {enabled ? (
                          <Link
                            href={href}
                            className={linkClass}
                            data-sidebar-topic={id}
                          >
                            <span className={lab.navModuleTitle}>{label}</span>
                            {showProgressRing && progressCounts ? (
                              <ModuleSidebarProgressRing
                                correct={progressCounts.correct}
                                total={progressCounts.total}
                              />
                            ) : null}
                          </Link>
                        ) : (
                          <span
                            className={lab.navLinkDisabled}
                            data-sidebar-topic={id}
                            title="Web exercises not available for this topic yet"
                          >
                            <span className={lab.navModuleTitle}>{label}</span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
