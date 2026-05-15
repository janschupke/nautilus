"use client";

import { lab } from "@/ui/lab";
import { ModuleSidebar } from "./ModuleSidebar";
import { NavHotkeys } from "./NavHotkeys";
import { TopBar } from "./TopBar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={lab.shell}>
      <NavHotkeys />
      <ModuleSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className={lab.main}>{children}</main>
      </div>
    </div>
  );
}
