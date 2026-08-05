/**
 * True when the user asked for reduced motion. Used to downgrade smooth
 * scrolling to instant; CSS transitions are handled globally in globals.css.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** `scrollIntoView` behaviour honouring the reduced-motion preference. */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

/**
 * Scrolls `container` the minimum distance needed to reveal `el`, the vertical
 * half of `scrollIntoView({ block: "nearest" })`.
 *
 * Deliberately not `scrollIntoView`: that moves the browser's sequential focus
 * navigation starting point into the scrolled element, so the next Tab would
 * land mid-sidebar instead of on the skip link (WCAG 2.4.1).
 */
export function scrollIntoViewNearest(
  container: HTMLElement,
  el: HTMLElement,
): void {
  const c = container.getBoundingClientRect();
  const e = el.getBoundingClientRect();
  const delta =
    e.top < c.top
      ? e.top - c.top
      : e.bottom > c.bottom
        ? e.bottom - c.bottom
        : 0;
  if (delta === 0) return;
  container.scrollTo({
    top: container.scrollTop + delta,
    behavior: scrollBehavior(),
  });
}
