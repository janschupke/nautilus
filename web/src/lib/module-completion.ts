import { LAB_MODULE_QUESTION_IDS } from "@/content/lab-module-question-ids";
import type { ProgressFileV1 } from "./types";
import { getQuestionState } from "./storage";

export type TopicLabProgressCounts = { correct: number; total: number };

/** Counts questions marked **correct** vs total registered for the topic lab. */
export function getTopicLabProgressCounts(
  progress: ProgressFileV1,
  topicId: string,
): TopicLabProgressCounts | null {
  const qids = LAB_MODULE_QUESTION_IDS[topicId];
  if (!qids?.length) return null;
  let correct = 0;
  for (const qid of qids) {
    if (getQuestionState(progress, topicId, qid).result === "correct") {
      correct += 1;
    }
  }
  return { correct, total: qids.length };
}

/** True if the learner has checked at least one question (correct or incorrect). */
export function topicHasAnswerChecks(
  progress: ProgressFileV1,
  topicId: string,
): boolean {
  const qids = LAB_MODULE_QUESTION_IDS[topicId];
  if (!qids?.length) return false;
  for (const qid of qids) {
    const r = getQuestionState(progress, topicId, qid).result;
    if (r === "correct" || r === "incorrect") return true;
  }
  return false;
}

/** Every question in the topic has been checked and marked correct. */
export function isTopicFullyCorrect(
  progress: ProgressFileV1,
  topicId: string,
): boolean {
  const counts = getTopicLabProgressCounts(progress, topicId);
  return counts !== null && counts.total > 0 && counts.correct === counts.total;
}
