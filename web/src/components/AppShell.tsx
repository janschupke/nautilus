"use client";

import { useState } from "react";
import { lab } from "@/ui/lab";
import { ModuleSidebar } from "./ModuleSidebar";
import { NavHotkeys } from "./NavHotkeys";
import { TopBar } from "./TopBar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={lab.shell}>
      <NavHotkeys />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <ModuleSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className={lab.main}>{children}</main>
      </div>
    </div>
  );
}
