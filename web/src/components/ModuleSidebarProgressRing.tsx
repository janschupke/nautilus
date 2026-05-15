type ModuleSidebarProgressRingProps = {
  correct: number;
  total: number;
};

const SIZE = 22;
const STROKE = 2.25;

/**
 * Compact ring for sidebar: arc length reflects **correct / total** lab questions.
 */
export function ModuleSidebarProgressRing({
  correct,
  total,
}: ModuleSidebarProgressRingProps) {
  if (total <= 0) return null;

  const r = (SIZE - STROKE) / 2;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const circumference = 2 * Math.PI * r;
  const fraction = Math.min(1, Math.max(0, correct / total));
  const dashOffset = circumference * (1 - fraction);
  const label = `${correct} of ${total} questions correct`;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="shrink-0"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <circle
        className="text-zinc-800"
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        className={fraction >= 1 ? "text-emerald-400" : "text-emerald-500"}
      />
    </svg>
  );
}
