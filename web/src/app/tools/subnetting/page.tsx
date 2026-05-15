import { SubnettingCalculator } from "./SubnettingCalculator";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PageHeader } from "@/components/PageHeader";
import { lab } from "@/ui/lab";

export default function SubnettingPage() {
  return (
    <div className={lab.content}>
      <Breadcrumb
        parent={{ href: "/tools", label: "Tools" }}
        current="Subnetting calculator"
      />
      <PageHeader title="Subnetting calculator">
        Enter an IPv4 address with a prefix length (CIDR notation) to calculate
        network details.
      </PageHeader>
      <SubnettingCalculator />
    </div>
  );
}
