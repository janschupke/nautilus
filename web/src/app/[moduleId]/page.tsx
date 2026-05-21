import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findModule } from "@/content/manifest";
import { getModuleContent } from "@/content/module-content";
import { PageHeader } from "@/components/PageHeader";
import { ModuleTopicList } from "./ModuleTopicList";
import { lab } from "@/ui/lab";

type ModulePageProps = {
  params: Promise<{ moduleId: string }>;
};

export async function generateMetadata({
  params,
}: ModulePageProps): Promise<Metadata> {
  const { moduleId } = await params;
  const mod = findModule(moduleId);
  return { title: mod?.title };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = await params;
  const mod = findModule(moduleId);
  if (!mod) notFound();

  const content = await getModuleContent(moduleId);

  return (
    <div className={lab.content}>
      <PageHeader title={mod.title}>{content?.intro}</PageHeader>

      <ModuleTopicList moduleId={moduleId} topics={mod.topics} />
    </div>
  );
}
