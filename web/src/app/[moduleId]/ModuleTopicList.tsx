"use client";

import Link from "next/link";
import { topicHasInteractiveContent } from "@/content/manifest";
import { useLabProgressStore } from "@/hooks/use-lab-progress-store";
import { getTopicLabProgressCounts } from "@/lib/module-completion";
import { ModuleSidebarProgressRing } from "@/components/ModuleSidebarProgressRing";
import { lab } from "@/ui/lab";
import type { TopicEntry } from "@/content/manifest";

type ModuleTopicListProps = {
  moduleId: string;
  topics: readonly TopicEntry[];
};

export function ModuleTopicList({ moduleId, topics }: ModuleTopicListProps) {
  const progress = useLabProgressStore();

  return (
    <ul className="space-y-2">
      {topics.map((topic) => {
        const interactive = topicHasInteractiveContent(topic.id);
        const counts = interactive
          ? getTopicLabProgressCounts(progress, topic.id)
          : null;
        return (
          <li key={topic.id}>
            <Link
              href={`/${moduleId}/${topic.id}`}
              className={`${lab.panel} ${lab.panelLink} flex items-center justify-between gap-4`}
            >
              <h2 className={lab.heading3}>{topic.label}</h2>
              {counts && (
                <ModuleSidebarProgressRing
                  correct={counts.correct}
                  total={counts.total}
                />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
