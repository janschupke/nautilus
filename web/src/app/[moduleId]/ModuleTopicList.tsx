"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { topicHasInteractiveContent } from "@/content/manifest";
import {
  parseProgressRaw,
  readLabProgressSnapshot,
  subscribeLabProgress,
} from "@/lib/storage";
import { getTopicLabProgressCounts } from "@/lib/module-completion";
import { ModuleSidebarProgressRing } from "@/components/ModuleSidebarProgressRing";
import { lab } from "@/ui/lab";
import type { TopicEntry } from "@/content/manifest";

type ModuleTopicListProps = {
  moduleId: string;
  topics: readonly TopicEntry[];
};

export function ModuleTopicList({ moduleId, topics }: ModuleTopicListProps) {
  const progressJson = useSyncExternalStore(
    subscribeLabProgress,
    readLabProgressSnapshot,
    () => "{}",
  );
  const progress = useMemo(
    () => parseProgressRaw(progressJson),
    [progressJson],
  );

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
              <span className={lab.heading3}>{topic.label}</span>
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
