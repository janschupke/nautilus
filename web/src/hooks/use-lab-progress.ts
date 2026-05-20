"use client";

import { useCallback, useEffect, useState } from "react";
import type { LabQuestion, LabTopic, ProgressFileV1 } from "@/lib/types";
import { anyAnswerMatches } from "@/lib/normalize-answer";
import {
  getQuestionState,
  loadProgress,
  saveProgress,
  setQuestionDraft,
  setQuestionResult,
} from "@/lib/storage";
import { SAVE_DEBOUNCE_MS } from "@/lib/constants";

export function useTopicProgress(topic: LabTopic) {
  const topicId = topic.id;
  const [progress, setProgress] = useState<ProgressFileV1>(() =>
    loadProgress(),
  );

  useEffect(() => {
    const handle = window.setTimeout(
      () => saveProgress(progress),
      SAVE_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(handle);
  }, [progress]);

  const updateDraft = useCallback(
    (questionId: string, draft: string) => {
      setProgress((p) => setQuestionDraft(p, topicId, questionId, draft));
    },
    [topicId],
  );

  const checkAnswer = useCallback(
    async (questionId: string, body: string, question: LabQuestion) => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      const accepted = [
        question.expectedOutput,
        ...(question.acceptedOutputs ?? []),
      ];
      const ok = anyAnswerMatches(
        body,
        accepted,
        question.caseInsensitive ?? false,
      );
      setProgress((p) =>
        setQuestionResult(
          p,
          topicId,
          questionId,
          body,
          ok ? "correct" : "incorrect",
        ),
      );
    },
    [topicId],
  );

  const questionState = useCallback(
    (questionId: string) => getQuestionState(progress, topicId, questionId),
    [progress, topicId],
  );

  return { questionState, updateDraft, checkAnswer };
}
