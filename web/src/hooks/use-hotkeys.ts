"use client";

import { useEffect, useRef } from "react";

export type HotkeyDef = {
  key: string;
  action: () => void;
};

function isInputFocused(e: KeyboardEvent): boolean {
  if (e.metaKey || e.ctrlKey || e.altKey) return true;
  const target = e.target as HTMLElement | null;
  const tag = target?.tagName?.toLowerCase() ?? "";
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    target?.isContentEditable === true ||
    target?.contentEditable === "true"
  );
}

/**
 * Registers keyboard shortcuts. Each entry in `hotkeys` is matched against
 * `KeyboardEvent.key`. Events are ignored when a form element is focused or
 * a modifier key is held.
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
      if (isInputFocused(e)) return;
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
