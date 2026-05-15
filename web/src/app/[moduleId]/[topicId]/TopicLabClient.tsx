"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { LabMarkdown } from "@/components/markdown/LabMarkdown";
import { QuestionBlock } from "@/components/lab/QuestionBlock";
import { useTopicProgress } from "@/hooks/use-lab-progress";
import { firstUnansweredQuestionIndex } from "@/lib/first-unanswered-question";
import {
  isTopicSummaryCollapsed,
  loadProgress,
  setTopicSummaryCollapsed,
} from "@/lib/storage";
import { MANIFEST, findModule } from "@/content/manifest";
import type { LabTopic } from "@/lib/types";
import { lab } from "@/ui/lab";

type TopicLabClientProps = {
  moduleId: string;
  topic: LabTopic;
};

export function TopicLabClient({ moduleId, topic }: TopicLabClientProps) {
  const { questionState, updateDraft, checkAnswer } = useTopicProgress(topic);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(() =>
    firstUnansweredQuestionIndex(topic, loadProgress()),
  );
  const [summaryExpanded, setSummaryExpanded] = useState(
    () => !isTopicSummaryCollapsed(topic.id),
  );

  const toggleQuestion = useCallback((index: number) => {
    setExpandedIndex((cur) => (cur === index ? null : index));
  }, []);

  // ── Prev / next navigation ────────────────────────────────────────────────

  const { prevHref, prevLabel, nextHref, nextLabel } = useMemo(() => {
    const mod = findModule(moduleId);
    const topics = mod?.topics ?? [];
    const idx = topics.findIndex((t) => t.id === topic.id);

    const prev =
      idx <= 0
        ? { href: `/${moduleId}`, label: "Module Summary" }
        : { href: `/${moduleId}/${topics[idx - 1]!.id}`, label: topics[idx - 1]!.label };

    const modIndex = MANIFEST.modules.findIndex((m) => m.id === moduleId);
    const nextMod = MANIFEST.modules[modIndex + 1];

    const next =
      idx < topics.length - 1
        ? { href: `/${moduleId}/${topics[idx + 1]!.id}`, label: topics[idx + 1]!.label }
        : nextMod
          ? { href: `/${nextMod.id}`, label: "Next Module" }
          : null;

    return {
      prevHref: prev.href,
      prevLabel: prev.label,
      nextHref: next?.href ?? null,
      nextLabel: next?.label ?? "",
    };
  }, [moduleId, topic.id]);

  // ── Render ────────────────────────────────────────────────────────────────

  const summaryHeadingId = `${topic.id}-topic-summary-heading`;
  const summaryPanelId = `${topic.id}-topic-summary-panel`;

  return (
    <div className={lab.content}>
      <header className="space-y-3">
        <p className={lab.workdir}>{topic.workdir}</p>
        <h1 className={lab.heading1}>{topic.shortTitle}</h1>
        <div className={lab.introAside}>
          <LabMarkdown markdown={topic.intro} variant="prompt" />
        </div>
      </header>

      {topic.summaryMarkdown ? (
        <section className={lab.moduleSummarySection}>
          <div className={lab.panel}>
            <button
              type="button"
              id={summaryHeadingId}
              className={lab.questionAccordionTrigger}
              aria-expanded={summaryExpanded}
              aria-controls={summaryPanelId}
              onClick={() => {
                setSummaryExpanded((open) => {
                  const next = !open;
                  setTopicSummaryCollapsed(topic.id, !next);
                  return next;
                });
              }}
            >
              <span className={lab.questionAccordionChevron} aria-hidden>
                {summaryExpanded ? "▼" : "▶"}
              </span>
              <span className={`flex-1 text-left ${lab.heading2}`}>
                Topic summary
              </span>
            </button>
            <div
              id={summaryPanelId}
              role="region"
              aria-labelledby={summaryHeadingId}
              hidden={!summaryExpanded}
              className={
                summaryExpanded ? lab.questionAccordionBody : undefined
              }
            >
              <LabMarkdown markdown={topic.summaryMarkdown} variant="summary" />
            </div>
          </div>
        </section>
      ) : null}

      <div className={`mt-10 ${lab.questionList}`}>
        {topic.questions.map((q, index) => {
          const st = questionState(q.id);
          return (
            <QuestionBlock
              key={q.id}
              topicId={topic.id}
              index={index}
              question={q}
              draft={st.draft}
              result={st.result}
              isExpanded={expandedIndex === index}
              onToggle={() => toggleQuestion(index)}
              onDraftChange={(value) => updateDraft(q.id, value)}
              onCheck={(body) => checkAnswer(q.id, body, q)}
            />
          );
        })}
      </div>

      {/* Prev / next navigation */}
      <div className="flex items-center justify-between gap-4 border-t border-stroke pt-6">
        <Link href={prevHref} className={`${lab.btnGhost} flex items-center gap-2`}>
          <span aria-hidden>←</span>
          <span className="max-w-[20rem] truncate">{prevLabel}</span>
        </Link>
        {nextHref && (
          <Link href={nextHref} className={`${lab.btnGhost} flex items-center gap-2`}>
            <span className="max-w-[20rem] truncate">{nextLabel}</span>
            <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
