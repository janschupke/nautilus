import { ScrollRegion } from "@/components/ScrollRegion";
import { lab } from "@/ui/lab";

/**
 * Scroll-safe table wrapper used in lab-setup and markdown summary tables.
 * Renders the border/overflow container and the base <table> element.
 * Pass <thead>, <tbody>, and their rows as children.
 */
export function LabTable({
  children,
  className,
  caption,
}: {
  children: React.ReactNode;
  className?: string;
  /** Names the table and its scroll region for screen readers. */
  caption?: string;
}) {
  return (
    <ScrollRegion
      label={caption ?? "Table"}
      className={`border border-stroke ${className ?? ""}`}
    >
      <table className={lab.table}>
        {caption && <caption className={lab.srOnly}>{caption}</caption>}
        {children}
      </table>
    </ScrollRegion>
  );
}
