"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { lab } from "@/ui/lab";
import { ModuleSidebar } from "./ModuleSidebar";
import { NavHotkeys } from "./NavHotkeys";
import { TopBar } from "./TopBar";

type AppShellProps = {
  children: React.ReactNode;
};

/** Matches the `md:` breakpoint the sidebar uses to stop being a drawer. */
const DESKTOP_QUERY = "(min-width: 768px)";

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Server renders the desktop layout, so default to it and let the store
  // correct after hydration.
  const isDesktop = useMediaQuery(DESKTOP_QUERY, true);

  return (
    <div id="app-root" className={lab.shell}>
      <a href="#main" className={lab.skipLink}>
        Skip to main content
      </a>
      <NavHotkeys />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <ModuleSidebar
        isOpen={sidebarOpen}
        isDesktop={isDesktop}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        {/* tabIndex allows the skip link to move focus here. */}
        <main id="main" tabIndex={-1} className={lab.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
