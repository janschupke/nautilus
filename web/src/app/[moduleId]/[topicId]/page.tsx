import { getLabTopic } from "@/content/lab-modules";
import { TopicLabGate } from "./TopicLabGate";
import { TopicPlaceholder } from "./TopicPlaceholder";

type TopicPageProps = {
  params: Promise<{ moduleId: string; topicId: string }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { moduleId, topicId } = await params;
  const topic = await getLabTopic(topicId);
  if (topic) {
    return <TopicLabGate moduleId={moduleId} topic={topic} />;
  }
  return <TopicPlaceholder topicId={topicId} />;
}
