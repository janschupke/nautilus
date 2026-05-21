import type { Metadata } from "next";
import { getLabTopic } from "@/content/lab-modules";
import { labelFromTopicId } from "@/content/manifest";
import { TopicLabGate } from "./TopicLabGate";
import { TopicPlaceholder } from "./TopicPlaceholder";

type TopicPageProps = {
  params: Promise<{ moduleId: string; topicId: string }>;
};

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { topicId } = await params;
  return { title: labelFromTopicId(topicId) };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { moduleId, topicId } = await params;
  const topic = await getLabTopic(topicId);
  if (topic) {
    return <TopicLabGate moduleId={moduleId} topic={topic} />;
  }
  return <TopicPlaceholder topicId={topicId} />;
}
