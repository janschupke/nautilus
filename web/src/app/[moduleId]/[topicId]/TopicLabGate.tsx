"use client";

import dynamic from "next/dynamic";
import type { LabTopic } from "@/lib/types";

const TopicLabClient = dynamic(
  () =>
    import("./TopicLabClient").then((m) => ({
      default: m.TopicLabClient,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="text-sm text-fg-faint" aria-live="polite">
        Loading lab UI…
      </div>
    ),
  },
);

type TopicLabGateProps = {
  moduleId: string;
  topic: LabTopic;
};

export function TopicLabGate({ moduleId, topic }: TopicLabGateProps) {
  return <TopicLabClient key={topic.id} moduleId={moduleId} topic={topic} />;
}
