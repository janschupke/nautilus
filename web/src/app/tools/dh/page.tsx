import type { Metadata } from "next";
import { DHCalculator } from "./DHCalculator";

export const metadata: Metadata = { title: "Diffie-Hellman calculator" };
import { Breadcrumb } from "@/components/Breadcrumb";
import { PageHeader } from "@/components/PageHeader";
import { lab } from "@/ui/lab";

export default function DHPage() {
  return (
    <div className={lab.content}>
      <Breadcrumb
        parent={{ href: "/tools", label: "Tools" }}
        current="Diffie-Hellman calculator"
      />
      <PageHeader title="Diffie-Hellman calculator">
        Enter any known parameters and the calculator derives the rest. All
        arithmetic uses BigInt — values of any size are supported.
      </PageHeader>
      <DHCalculator />
    </div>
  );
}
