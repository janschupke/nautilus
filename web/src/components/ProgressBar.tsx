type ProgressBarProps = {
  correct: number;
  incorrect: number;
  total: number;
};

export function ProgressBar({ correct, incorrect, total }: ProgressBarProps) {
  if (total === 0) return null;
  const correctPct = (correct / total) * 100;
  const incorrectPct = (incorrect / total) * 100;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
      role="progressbar"
      aria-valuenow={correct}
      aria-valuemax={total}
    >
      <div className="flex h-full">
        <div
          className="h-full bg-emerald-600 transition-all"
          style={{ width: `${correctPct}%` }}
        />
        <div
          className="h-full bg-rose-800 transition-all"
          style={{ width: `${incorrectPct}%` }}
        />
      </div>
    </div>
  );
}
