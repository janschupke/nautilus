import { lab } from "@/ui/lab";

type LiveStatusProps = {
  /** Empty string clears the region without unmounting it. */
  message: string;
};

/**
 * Visually hidden live region for outcomes that are otherwise only visible
 * (calculator results, copy confirmations, answer checks) — WCAG 4.1.3.
 *
 * The region element always renders and only its text changes; a region that
 * mounts together with its message is frequently missed by screen readers.
 *
 * Prefer promoting an already-visible element to `role="status"` where one
 * exists; use this when nothing on screen carries the message.
 */
export function LiveStatus({ message }: LiveStatusProps) {
  return (
    <div role="status" aria-live="polite" className={lab.srOnly}>
      {message}
    </div>
  );
}

/** As `LiveStatus`, but interrupts the screen reader — for errors only. */
export function LiveAlert({ message }: LiveStatusProps) {
  return (
    <div role="alert" className={lab.srOnly}>
      {message}
    </div>
  );
}
