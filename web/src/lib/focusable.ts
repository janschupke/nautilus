/**
 * Focusable-element discovery for focus traps (modal dialog, mobile drawer).
 *
 * Visibility is decided structurally (`hidden` / `inert` / `aria-hidden`
 * ancestors) rather than by layout — jsdom has no layout engine, so
 * `offsetParent` and `getBoundingClientRect` report zero for every element and
 * would make traps look empty in unit tests.
 */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "details",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isReachable(el: HTMLElement): boolean {
  if (el.closest("[hidden]")) return false;
  if (el.closest("[inert]")) return false;
  if (el.closest("[aria-hidden='true']")) return false;
  return true;
}

/** Focusable descendants of `root`, in DOM order. */
export function getFocusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    isReachable,
  );
}
