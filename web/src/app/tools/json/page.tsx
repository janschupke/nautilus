import { JsonFormatter } from "./JsonFormatter";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PageHeader } from "@/components/PageHeader";
import { lab } from "@/ui/lab";

export default function JsonPage() {
  return (
    <div className={lab.content}>
      <Breadcrumb parent={{ href: "/tools", label: "Tools" }} current="JSON formatter" />
      <PageHeader title="JSON formatter">
        Paste JSON to prettify, minify, or validate it.
      </PageHeader>
      <JsonFormatter />
    </div>
  );
}
