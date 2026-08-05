type ProgressBarProps = {
  correct: number;
  incorrect: number;
  total: number;
  /** Names the bar for screen readers, e.g. "Overall progress". */
  label: string;
};

/**
 * Segment fills clear 3:1 against the track (WCAG 1.4.11) and are separated by
 * a surface-coloured hairline, since emerald-500 and rose-400 are close in
 * luminance. `aria-valuetext` carries the incorrect count, which the numeric
 * value alone cannot express.
 */
export function ProgressBar({
  correct,
  incorrect,
  total,
  label,
}: ProgressBarProps) {
  if (total === 0) return null;
  const correctPct = (correct / total) * 100;
  const incorrectPct = (incorrect / total) * 100;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-stroke"
      role="progressbar"
      aria-label={label}
      aria-valuenow={correct}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuetext={`${correct} of ${total} correct, ${incorrect} incorrect`}
    >
      <div className="flex h-full">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${correctPct}%` }}
        />
        <div
          className={`h-full bg-rose-400 transition-all${
            correct > 0 && incorrect > 0 ? " border-l border-surface" : ""
          }`}
          style={{ width: `${incorrectPct}%` }}
        />
      </div>
    </div>
  );
}
