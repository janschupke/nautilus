import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RTFM_MANIFEST, findCheatsheet } from "@/content/rtfm-manifest";
import { loadCheatsheet } from "@/content/rtfm-loader";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LabMarkdown } from "@/components/markdown/LabMarkdown";
import { lab } from "@/ui/lab";

export async function generateStaticParams() {
  return RTFM_MANIFEST.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = findCheatsheet(slug);
  return { title: meta?.title };
}

export default async function CheatsheetPage({ params }: Props) {
  const { slug } = await params;
  const meta = findCheatsheet(slug);
  if (!meta) notFound();

  const markdown = await loadCheatsheet(slug);
  if (!markdown) notFound();

  return (
    <div className={lab.content}>
      <Breadcrumb
        parent={{ href: "/rtfm", label: "RTFM" }}
        current={meta.title}
        mono
      />

      <div className={lab.panel}>
        <LabMarkdown markdown={markdown} variant="summary" />
      </div>
    </div>
  );
}
