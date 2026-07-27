"use client";

import { useCallback, useMemo, useState } from "react";
import type { LabQuestion, QuestionResult } from "@/lib/types";
import { LabMarkdown } from "@/components/markdown/LabMarkdown";
import { Modal } from "@/components/Modal";
import { resolveAnswerFormat } from "@/lib/lab-answer-format";
import { lab, labLineInputClasses, labTextareaClasses } from "@/ui/lab";

type QuestionBlockProps = {
  topicId: string;
  index: number;
  question: LabQuestion;
  draft: string;
  result: QuestionResult;
  isExpanded: boolean;
  onToggle: () => void;
  onDraftChange: (value: string) => void;
  /** May be async (e.g. debounced storage); while pending the check UI is busy. */
  onCheck: (body: string) => void | Promise<void>;
};

function ResultBadge({ result }: { result: QuestionResult }) {
  if (result === "correct") {
    return <span className={lab.badgeOk}>Correct</span>;
  }
  if (result === "incorrect") {
    return <span className={lab.badgeBad}>Incorrect</span>;
  }
  return null;
}

export function QuestionBlock({
  topicId,
  index,
  question,
  draft,
  result,
  isExpanded,
  onToggle,
  onDraftChange,
  onCheck,
}: QuestionBlockProps) {
  const [checkPending, setCheckPending] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const fieldId = `${topicId}-${question.id}`;
  const headingId = `${fieldId}-heading`;
  const panelId = `${fieldId}-panel`;

  const answerFormat = resolveAnswerFormat(question);
  const lineDraft = useMemo(
    () =>
      answerFormat === "line" ? (draft.split(/\r\n|\n|\r/)[0] ?? "") : draft,
    [answerFormat, draft],
  );

  const acceptedAnswers = useMemo(
    () => [question.expectedOutput, ...(question.acceptedOutputs ?? [])],
    [question.expectedOutput, question.acceptedOutputs],
  );

  const runCheck = useCallback(async () => {
    if (checkPending) return;
    setCheckPending(true);
    const body = answerFormat === "line" ? lineDraft : draft;
    try {
      await Promise.resolve(onCheck(body));
    } finally {
      setCheckPending(false);
    }
  }, [answerFormat, checkPending, draft, lineDraft, onCheck]);

  const answerLabel =
    answerFormat === "line" ? "Your answer" : "Your answer (stdout)";

  return (
    <>
      <section className={lab.panel} aria-labelledby={headingId}>
        <button
          type="button"
          id={headingId}
          className={lab.questionAccordionTrigger}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={lab.questionAccordionChevron} aria-hidden>
            {isExpanded ? "▼" : "▶"}
          </span>
          <span className={`flex-1 ${lab.heading3}`}>Question {index + 1}</span>
          <span className="shrink-0">
            <ResultBadge result={result} />
          </span>
        </button>

        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          hidden={!isExpanded}
          className={isExpanded ? lab.questionAccordionBody : undefined}
        >
          <div>
            <LabMarkdown markdown={question.prompt} variant="prompt" />
          </div>
          <label className={lab.fieldLabel} htmlFor={fieldId}>
            {answerLabel}
          </label>
          {answerFormat === "line" ? (
            <input
              id={fieldId}
              type="text"
              className={labLineInputClasses(result)}
              value={lineDraft}
              disabled={checkPending}
              onChange={(e) => {
                const v = e.target.value.split(/\r\n|\n|\r/)[0] ?? "";
                onDraftChange(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!checkPending) void runCheck();
                }
              }}
              spellCheck={false}
              autoComplete="off"
            />
          ) : (
            <textarea
              id={fieldId}
              className={labTextareaClasses(result)}
              rows={8}
              value={draft}
              disabled={checkPending}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!checkPending) void runCheck();
                }
              }}
              spellCheck={false}
              autoComplete="off"
            />
          )}
          <p className={`mt-2 ${lab.hint}`}>
            {answerFormat === "line"
              ? "Press Enter to check."
              : "Press Enter to check. Use Shift+Enter for a new line."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={lab.btnPrimary}
              disabled={checkPending}
              aria-busy={checkPending ? true : undefined}
              onClick={() => void runCheck()}
            >
              {checkPending ? "Checking…" : "Check answer"}
            </button>
            <button
              type="button"
              className={lab.btnGhost}
              onClick={() => setShowAnswers(true)}
            >
              Accepted answers
            </button>
          </div>
          <details className={lab.details}>
            <summary className={lab.detailsSummary}>Solution</summary>
            <div className={lab.questionAccordionBody}>
              <LabMarkdown
                markdown={question.solutionMarkdown}
                variant="solution"
              />
            </div>
          </details>
        </div>
      </section>

      <Modal
        open={showAnswers}
        onClose={() => setShowAnswers(false)}
        title="Accepted answers"
      >
        <div className="mt-4 flex flex-col gap-2">
          {acceptedAnswers.map((ans, i) => (
            <pre key={i} className={lab.codeBlock}>
              {ans}
            </pre>
          ))}
        </div>
        <div className={lab.modalActions}>
          <button
            type="button"
            className={lab.btnGhostSm}
            onClick={() => setShowAnswers(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
