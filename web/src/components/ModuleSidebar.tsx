"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from "react";
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
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { scrollBehavior } from "@/lib/motion";
import { lab } from "@/ui/lab";

/** Target of the top bar hamburger's `aria-controls`. */
export const SIDEBAR_ID = "course-navigation";

type ModuleSidebarProps = {
  isOpen: boolean;
  /** At `md` and up the sidebar is permanent, not an overlay drawer. */
  isDesktop: boolean;
  onClose: () => void;
};

export function ModuleSidebar({
  isOpen,
  isDesktop,
  onClose,
}: ModuleSidebarProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const listIdBase = useId();
  // As an overlay drawer it behaves like a dialog: focus is confined while
  // open and Escape dismisses it.
  const isDrawerOpen = !isDesktop && isOpen;
  useFocusTrap(asideRef, isDrawerOpen);
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
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDrawerOpen, onClose]);

  useEffect(() => {
    if (!navRef.current) return;
    const topicId = pendingScrollTopicRef.current;
    if (topicId) {
      const el = navRef.current.querySelector<HTMLElement>(
        `[data-sidebar-topic="${CSS.escape(topicId)}"]`,
      );
      if (el) {
        el.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
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
        el.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
        pendingScrollModuleRef.current = null;
      }
    }
  }, [pathname, modulesRaw]);

  return (
    <aside
      ref={asideRef}
      id={SIDEBAR_ID}
      tabIndex={-1}
      aria-label="Course navigation"
      // Off-canvas but still in the DOM: without `inert` a keyboard user tabs
      // through ~80 invisible links.
      inert={!isDesktop && !isOpen}
      className={`fixed inset-y-0 left-0 z-40 flex w-80 shrink-0 flex-col border-r border-stroke bg-surface text-lg transition-transform duration-200 ease-in-out md:relative md:inset-auto md:z-auto md:translate-x-0 md:transition-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
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
      <nav
        aria-label="Site sections"
        className="flex flex-col border-b border-stroke p-2 md:hidden"
      >
        {[
          { href: "/", label: "Home" },
          { href: "/lab-setup", label: "Lab setup" },
          { href: "/stats", label: "Stats" },
          { href: "/tools", label: "Tools" },
          { href: "/rtfm", label: "RTFM" },
        ].map(({ href, label }) => {
          const active =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${lab.navLink} ${active ? lab.navLinkActive : ""}`}
            >
              <span className={lab.navModuleTitle}>{label}</span>
            </Link>
          );
        })}
      </nav>
      <nav
        ref={navRef}
        aria-label="Modules"
        className="min-h-0 flex-1 overflow-y-auto p-2"
      >
        {MANIFEST.modules.map((mod, modIndex) => {
          const collapsed = collapsedIds.has(mod.id);
          const moduleActive = activeModulePageId === mod.id;
          const moduleLabel = `${formatModuleIndex(modIndex)} — ${mod.title}`;
          const topicListId = `${listIdBase}-${mod.id}`;
          return (
            <div key={mod.id} className="mb-5">
              {/* Module header: caret toggle on left, link to summary on right */}
              <div
                className="flex w-full items-center rounded-md"
                data-sidebar-module={mod.id}
              >
                <button
                  type="button"
                  // Naming the module matters: a screen reader listing buttons
                  // would otherwise hear "Expand module" eight times.
                  aria-label={`${collapsed ? "Expand" : "Collapse"} ${moduleLabel}`}
                  aria-expanded={!collapsed}
                  aria-controls={topicListId}
                  onClick={() => toggleSidebarModuleCollapsed(mod.id)}
                  className={`shrink-0 rounded-md px-2 py-1.5 text-fg-faint hover:bg-surface-raised hover:text-fg-soft ${lab.focusRing}`}
                >
                  <span aria-hidden>{collapsed ? "▸" : "▾"}</span>
                </button>
                <Link
                  href={`/${mod.id}`}
                  aria-current={moduleActive ? "page" : undefined}
                  className={`${lab.navCategoryToggle} flex-1 ${moduleActive ? lab.navCategoryActive : ""}`}
                >
                  <span className="min-w-0 flex-1">{moduleLabel}</span>
                </Link>
              </div>

              {/* Rendered even when collapsed (just `hidden`) so the caret's
                  aria-controls always resolves to a real element. */}
              <ul id={topicListId} hidden={collapsed} className="space-y-1">
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
                          aria-current={active ? "page" : undefined}
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
                        // Not a link: the status is spelled out rather than
                        // left to the colour and the `title` tooltip.
                        <span
                          className={lab.navLinkDisabled}
                          data-sidebar-topic={id}
                        >
                          <span className={lab.navModuleTitle}>{label}</span>
                          <span className={lab.srOnly}>
                            — web exercises not available yet
                          </span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
