import { REGISTERED_LAB_TOPIC_IDS, getLabTopic } from "@/content/lab-modules";
import { MANIFEST } from "@/content/manifest";
import type {
  LabModuleProgressShape,
  LabTopicProgressShape,
} from "@/lib/summarize-lab-progress";
import { PageHeader } from "@/components/PageHeader";
import { lab } from "@/ui/lab";
import { StatsSummary } from "./StatsSummary";

export default async function StatsPage() {
  const loaded = await Promise.all(
    REGISTERED_LAB_TOPIC_IDS.map(async (id) => {
      const t = await getLabTopic(id);
      if (!t) return null;
      const shape: LabTopicProgressShape = {
        topicId: t.id,
        title: t.title,
        questionIds: t.questions.map((q) => q.id),
      };
      return shape;
    }),
  );

  const topicMap = new Map(
    loaded
      .filter((t): t is LabTopicProgressShape => t !== null)
      .map((t) => [t.topicId, t]),
  );

  const modules: LabModuleProgressShape[] = MANIFEST.modules
    .map((mod) => ({
      moduleId: mod.id,
      title: mod.title,
      topics: mod.topics
        .map((entry) => topicMap.get(entry.id))
        .filter((t): t is LabTopicProgressShape => t !== undefined),
    }))
    .filter((mod) => mod.topics.length > 0);

  return (
    <div className={lab.content}>
      <PageHeader title="Stats">
        Totals for interactive lab topics. Open a topic from the sidebar to
        answer questions; results are stored only in this browser.
      </PageHeader>
      <StatsSummary modules={modules} />
    </div>
  );
}
