"use client";

import { useEffect, useRef } from "react";

export type HotkeyDef = {
  key: string;
  action: () => void;
};

/** Widgets that consume plain character keys as input. */
const TEXTUAL_ROLES = new Set([
  "textbox",
  "searchbox",
  "combobox",
  "spinbutton",
]);

function shouldIgnore(e: KeyboardEvent): boolean {
  // Modifier held: leave browser and assistive-technology shortcuts alone.
  if (e.metaKey || e.ctrlKey || e.altKey) return true;
  // A modal owns the screen — navigating out from under it loses the user.
  if (
    typeof document !== "undefined" &&
    document.querySelector('[role="dialog"][aria-modal="true"]')
  ) {
    return true;
  }
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName?.toLowerCase() ?? "";
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target?.isContentEditable === true ||
    target?.contentEditable === "true" ||
    TEXTUAL_ROLES.has(target?.getAttribute("role") ?? "")
  );
}

/**
 * Registers keyboard shortcuts. Each entry in `hotkeys` is matched against
 * `KeyboardEvent.key`. Events are ignored when a text-entry widget is focused,
 * a modal dialog is open, or a modifier key is held.
 *
 * Callers passing unmodified character keys must let the user switch them off
 * (WCAG 2.1.4) — see `useHotkeysEnabled`; passing an empty array disables them.
 *
 * The event listener is installed once; the current hotkeys are read via a
 * ref on every keypress so callers do not need to memoize the array.
 */
export function useHotkeys(hotkeys: HotkeyDef[]): void {
  const ref = useRef<HotkeyDef[]>(hotkeys);
  useEffect(() => {
    ref.current = hotkeys;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (shouldIgnore(e)) return;
      const match = ref.current.find((h) => h.key === e.key);
      if (match) {
        e.preventDefault();
        match.action();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
