import { lab } from "@/ui/lab";

type ScrollRegionProps = {
  /** Names the region for screen readers, e.g. "Lab hosts table". */
  label: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Horizontally scrolling container that a keyboard-only user can actually
 * scroll (WCAG 2.1.1) — `tabIndex={0}` makes it focusable so arrow keys reach
 * the overflowed content, and the label explains what it is once focused.
 *
 * `role="group"` rather than `role="region"`: these appear many times per page
 * and would otherwise flood the landmark list.
 */
export function ScrollRegion({
  label,
  className,
  children,
}: ScrollRegionProps) {
  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={0}
      className={`${lab.scrollRegion}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
