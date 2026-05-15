import type { LabTopic, ProgressFileV1 } from "@/lib/types";
import { getQuestionState } from "@/lib/storage";

/**
 * First question index (0-based) that is not yet answered **correctly**
 * (`idle` or `incorrect`). Used to expand the learner's current item on load.
 * When every question is `correct` (or there are no questions), returns `0`.
 */
export function firstUnansweredQuestionIndex(
  topic: LabTopic,
  progress: ProgressFileV1,
): number {
  for (let i = 0; i < topic.questions.length; i++) {
    const qid = topic.questions[i].id;
    const st = getQuestionState(progress, topic.id, qid);
    if (st.result !== "correct") return i;
  }
  return 0;
}
