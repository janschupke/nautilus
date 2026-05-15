import { lab } from "@/ui/lab";

/**
 * Scroll-safe table wrapper used in lab-setup and markdown summary tables.
 * Renders the border/overflow container and the base <table> element.
 * Pass <thead>, <tbody>, and their rows as children.
 */
export function LabTable({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto rounded-md border border-zinc-800 ${className ?? ""}`}>
      <table className={lab.table}>{children}</table>
    </div>
  );
}
