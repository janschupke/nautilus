import type { Metadata } from "next";
import { RTFM_MANIFEST } from "@/content/rtfm-manifest";

export const metadata: Metadata = { title: "RTFM" };
import { PageHeader } from "@/components/PageHeader";
import { NavCardList, type NavCardItem } from "@/components/NavCardList";
import { lab } from "@/ui/lab";

export default function RtfmPage() {
  const items: NavCardItem[] = RTFM_MANIFEST.map((sheet) => ({
    href: `/rtfm/${sheet.slug}`,
    title: sheet.title,
    description: sheet.description,
  }));

  return (
    <div className={lab.content}>
      <PageHeader title="RTFM">
        Quick-reference cheatsheets for tools used in security work.
      </PageHeader>
      <NavCardList items={items} mono />
    </div>
  );
}
