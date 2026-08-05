"use client";

import { useEffect, type RefObject } from "react";
import { getFocusableElements } from "@/lib/focusable";

type FocusTrapOptions = {
  /** Element to focus when the trap activates; defaults to the first focusable. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Return focus to whatever was focused before activation (default true). */
  restoreFocus?: boolean;
};

/**
 * Confines Tab / Shift+Tab to `containerRef` while `active`, moves focus into
 * the container on activation and restores it on deactivation.
 *
 * A `focusin` guard on the document pulls focus back if it escapes by any other
 * route — notably when the focused control inside the container is removed or
 * disabled mid-interaction, which otherwise drops focus to `<body>`.
 *
 * The container must be focusable as a fallback (`tabIndex={-1}`) for dialogs
 * that contain no focusable children.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  { initialFocus, restoreFocus = true }: FocusTrapOptions = {},
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const target =
        initialFocus?.current ?? getFocusableElements(container)[0];
      (target ?? container).focus();
    };
    focusFirst();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const activeEl = document.activeElement;
      if (e.shiftKey && (activeEl === first || activeEl === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Node | null;
      if (target && container.contains(target)) return;
      focusFirst();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      if (restoreFocus && previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef, initialFocus, restoreFocus]);
}
