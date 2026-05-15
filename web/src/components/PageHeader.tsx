import { lab } from "@/ui/lab";

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

/** Page-level h1 with an optional muted description paragraph. */
export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header>
      <h1 className={lab.heading1}>{title}</h1>
      {children && <p className={`mt-3 ${lab.muted}`}>{children}</p>}
    </header>
  );
}
