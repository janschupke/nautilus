import type { ProgressFileV1 } from "./types";
import { getQuestionState } from "./storage";

export type LabTopicProgressShape = {
  topicId: string;
  title: string;
  questionIds: readonly string[];
};

export type LabProgressSummary = {
  moduleCount: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
};

export type LabTopicSummary = {
  topicId: string;
  title: string;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
};

export type LabModuleProgressShape = {
  moduleId: string;
  title: string;
  topics: readonly LabTopicProgressShape[];
};

export type LabModuleSummary = {
  moduleId: string;
  title: string;
  topicCount: number;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
};

export function summarizeTopicProgress(
  progress: ProgressFileV1,
  topic: LabTopicProgressShape,
): LabTopicSummary {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  for (const qid of topic.questionIds) {
    const st = getQuestionState(progress, topic.topicId, qid);
    if (st.result === "correct") correct++;
    else if (st.result === "incorrect") incorrect++;
    else unanswered++;
  }
  return {
    topicId: topic.topicId,
    title: topic.title,
    total: topic.questionIds.length,
    correct,
    incorrect,
    unanswered,
  };
}

export function summarizeModuleProgress(
  progress: ProgressFileV1,
  mod: LabModuleProgressShape,
): LabModuleSummary {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let total = 0;
  for (const topic of mod.topics) {
    const s = summarizeTopicProgress(progress, topic);
    correct += s.correct;
    incorrect += s.incorrect;
    unanswered += s.unanswered;
    total += s.total;
  }
  return {
    moduleId: mod.moduleId,
    title: mod.title,
    topicCount: mod.topics.length,
    total,
    correct,
    incorrect,
    unanswered,
  };
}

export function summarizeLabProgress(
  progress: ProgressFileV1,
  modules: readonly LabModuleProgressShape[],
): LabProgressSummary {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const mod of modules) {
    const s = summarizeModuleProgress(progress, mod);
    correct += s.correct;
    incorrect += s.incorrect;
    unanswered += s.unanswered;
  }

  const totalQuestions = modules.reduce(
    (n, m) => n + m.topics.reduce((a, t) => a + t.questionIds.length, 0),
    0,
  );

  return {
    moduleCount: modules.length,
    totalQuestions,
    correct,
    incorrect,
    unanswered,
  };
}
