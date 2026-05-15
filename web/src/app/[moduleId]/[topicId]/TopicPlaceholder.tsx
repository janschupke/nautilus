import { labelFromTopicId } from "@/content/manifest";
import { lab } from "@/ui/lab";

type TopicPlaceholderProps = {
  topicId: string;
};

export function TopicPlaceholder({ topicId }: TopicPlaceholderProps) {
  return (
    <div className={lab.content}>
      <h1 className={lab.heading2}>{labelFromTopicId(topicId)}</h1>
      <p className={`mt-3 ${lab.muted}`}>
        Interactive checks for this topic are not available in the web UI. If
        you expected a lab here, ensure{" "}
        <code className={lab.docCode}>src/content/lab-modules.ts</code>{" "}
        registers a JSON bundle under{" "}
        <code className={lab.docCode}>src/content/topics/</code>.
      </p>
    </div>
  );
}
