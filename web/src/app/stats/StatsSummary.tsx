"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clearAllProgress, clearTopicsProgress } from "@/lib/storage";
import { useLabProgressStore } from "@/hooks/use-lab-progress-store";
import {
  summarizeLabProgress,
  summarizeModuleProgress,
  type LabModuleProgressShape,
  type LabModuleSummary,
} from "@/lib/summarize-lab-progress";
import { ResetProgressModal } from "@/components/ResetProgressModal";
import { ProgressBar } from "@/components/ProgressBar";
import { formatModuleIndex } from "@/lib/format";
import { lab } from "@/ui/lab";

type StatsSummaryProps = {
  modules: readonly LabModuleProgressShape[];
};

type ResetTarget =
  | { kind: "all" }
  | { kind: "module"; moduleId: string; title: string; topicIds: string[] };

function ModuleCard({
  summary,
  onReset,
}: {
  summary: LabModuleSummary;
  onReset: () => void;
}) {
  const { title, topicCount, total, correct, incorrect, unanswered } = summary;

  return (
    <div
      className={`${lab.panel} ${lab.panelLink} relative flex flex-col gap-3`}
    >
      {/* Stretched link — covers the whole card; Reset button sits above it via z-10 */}
      <Link
        href={`/${summary.moduleId}`}
        className="absolute inset-0 rounded-xl"
        aria-label={title}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={lab.heading3}>{title}</h3>
          <p className={`mt-0.5 text-sm ${lab.hint}`}>
            {topicCount} {topicCount === 1 ? "topic" : "topics"} · {total}{" "}
            {total === 1 ? "question" : "questions"}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className={`relative z-10 ${lab.btnDangerSm}`}
        >
          Reset
        </button>
      </div>

      <div className="flex gap-4 text-sm">
        <span className={lab.statCorrect}>
          <span className="font-mono font-semibold tabular-nums">
            {correct}
          </span>{" "}
          correct
        </span>
        <span className={lab.statIncorrect}>
          <span className="font-mono font-semibold tabular-nums">
            {incorrect}
          </span>{" "}
          incorrect
        </span>
        <span className={lab.statUnanswered}>
          <span className="font-mono font-semibold tabular-nums">
            {unanswered}
          </span>{" "}
          unanswered
        </span>
      </div>

      <ProgressBar correct={correct} incorrect={incorrect} total={total} />

      <p className={`text-right text-xs ${lab.hint}`}>
        {correct}/{total} answered correctly
      </p>
    </div>
  );
}

export function StatsSummary({ modules }: StatsSummaryProps) {
  const [resetTarget, setResetTarget] = useState<ResetTarget | null>(null);

  const progress = useLabProgressStore();

  const aggregate = useMemo(
    () => summarizeLabProgress(progress, modules),
    [progress, modules],
  );

  const moduleSummaries = useMemo(
    () => modules.map((m) => summarizeModuleProgress(progress, m)),
    [progress, modules],
  );

  if (modules.length === 0) {
    return (
      <p className={`mt-8 ${lab.muted}`}>
        No interactive lab topics are registered yet.
      </p>
    );
  }

  return (
    <>
      {/* Aggregate bar */}
      <div className={lab.panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className={lab.statsLabel}>
            {aggregate.correct} / {aggregate.totalQuestions} questions correct
            across {aggregate.moduleCount} modules
          </p>
          <button
            type="button"
            className={lab.btnDanger}
            onClick={() => setResetTarget({ kind: "all" })}
          >
            Reset all…
          </button>
        </div>
        <div className="mt-4">
          <ProgressBar
            correct={aggregate.correct}
            incorrect={aggregate.incorrect}
            total={aggregate.totalQuestions}
          />
        </div>
      </div>

      {/* Per-module cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {moduleSummaries.map((s, i) => (
          <ModuleCard
            key={s.moduleId}
            summary={{ ...s, title: `${formatModuleIndex(i)} — ${s.title}` }}
            onReset={() =>
              setResetTarget({
                kind: "module",
                moduleId: s.moduleId,
                title: s.title,
                topicIds: modules
                  .find((m) => m.moduleId === s.moduleId)!
                  .topics.map((t) => t.topicId),
              })
            }
          />
        ))}
      </div>

      <ResetProgressModal
        key={JSON.stringify(resetTarget)}
        open={resetTarget !== null}
        onClose={() => setResetTarget(null)}
        onConfirm={() => {
          if (!resetTarget) return;
          if (resetTarget.kind === "all") {
            clearAllProgress();
          } else {
            clearTopicsProgress(resetTarget.topicIds);
          }
        }}
        title={
          resetTarget?.kind === "module"
            ? `Reset "${resetTarget.title}"?`
            : "Reset all progress?"
        }
        body={
          resetTarget?.kind === "module"
            ? "This removes all saved answers and results for every topic in this module. Cannot be undone."
            : "This removes every saved answer and result from this browser. Cannot be undone."
        }
        confirmLabel={
          resetTarget?.kind === "module" ? "Reset module" : "Reset all"
        }
      />
    </>
  );
}
