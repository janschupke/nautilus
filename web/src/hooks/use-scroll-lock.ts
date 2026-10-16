"use client";

import { useEffect } from "react";

/** Open overlays holding the lock; a modal can open over the drawer. */
let holders = 0;

/**
 * Stops the page scrolling behind an overlay while `active`. The document is
 * the app's only scroller, so this locks `<html>`; `scrollbar-gutter: stable`
 * in globals.css keeps the layout from shifting when the scrollbar goes away.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    holders += 1;
    document.documentElement.style.overflow = "hidden";
    return () => {
      holders -= 1;
      if (holders === 0) document.documentElement.style.overflow = "";
    };
  }, [active]);
}
