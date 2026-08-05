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
