/**
 * Shared layout and typography for the labs UI. Bump sizes here when tuning
 * readability; components should prefer these over ad-hoc Tailwind strings.
 *
 * Colour references use semantic tokens defined in globals.css @theme:
 *   surface / surface-raised   — zinc-950 / zinc-900
 *   stroke / stroke-muted      — zinc-800 / zinc-700
 *   fg / fg-soft / fg-muted / fg-faint / fg-disabled — zinc scale
 *   accent / accent-surface / accent-stroke / accent-fg — emerald scale
 *   danger / danger-surface / danger-fg — rose scale
 */
import type { QuestionResult } from "@/lib/types";

export const lab = {
  shell: "bg-decoration flex h-screen overflow-hidden text-fg",
  main: "min-h-0 flex-1 overflow-y-auto p-6 text-lg leading-relaxed lg:p-10",
  content: "mx-auto max-w-6xl space-y-10 pb-16",

  sidebar:
    "flex w-80 shrink-0 flex-col border-r border-stroke bg-surface text-lg",
  sidebarHeader: "border-b border-stroke pr-4 pt-1",
  sidebarHomeLink:
    "flex min-w-0 items-center gap-3 rounded-md outline-none hover:text-accent-fg focus-visible:ring-2 focus-visible:ring-accent-stroke/80",
  sidebarLogo: "w-full object-contain opacity-80",
  sidebarTitle: "text-2xl font-semibold tracking-tight text-fg",
  sidebarSubtitle: "mt-1 text-base text-fg-faint",
  navCategoryToggle:
    "flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left text-base font-semibold uppercase tracking-wide text-fg-faint outline-none hover:bg-surface-raised hover:text-fg-soft focus-visible:ring-2 focus-visible:ring-accent-stroke/80",
  /** Applied to the module heading link when the module summary page is the active route. */
  navCategoryActive:
    "bg-accent-surface/35 text-fg-soft ring-1 ring-accent-stroke/60",
  navCategoryChevron: "w-5 shrink-0 text-center text-base text-fg-faint",
  /** Module label inside the nav row (link/span); truncates so the ring stays visible. */
  navModuleTitle: "min-w-0 flex-1 truncate",
  navLink:
    "flex min-w-0 w-full items-center gap-2 rounded-md px-2 py-2 text-base text-fg-soft outline-none hover:bg-surface-raised",
  /** All lab questions in the module are marked correct (inactive link). */
  navLinkComplete:
    "flex min-w-0 w-full items-center gap-2 rounded-md px-2 py-2 text-base text-accent-fg/90 bg-accent-surface/25 ring-1 ring-emerald-900/40 outline-none hover:bg-accent-surface/45",
  navLinkActive:
    "flex min-w-0 w-full items-center gap-2 rounded-md px-2 py-2 text-base bg-accent-surface/60 text-emerald-100 ring-1 ring-accent-stroke/80 outline-none",
  /** Current module that is also fully correct — stronger ring than in-progress active. */
  navLinkActiveComplete:
    "flex min-w-0 w-full items-center gap-2 rounded-md px-2 py-2 text-base bg-accent-surface/70 text-emerald-50 ring-2 ring-emerald-500/75 outline-none",
  navLinkDisabled:
    "flex min-w-0 w-full cursor-not-allowed items-center gap-2 rounded-md px-2 py-2 text-base text-fg-disabled",

  topBar:
    "flex h-16 shrink-0 items-center justify-end border-b border-stroke bg-surface/80 px-5 text-lg backdrop-blur",
  topBarActions: "flex shrink-0 items-center gap-2",

  docSection: "mt-10 space-y-3",
  docBody: "text-lg leading-relaxed text-fg-soft",
  docList: "mt-3 list-disc space-y-2 pl-6 text-lg leading-relaxed text-fg-soft",
  docCode:
    "rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[0.95em] text-accent-fg",
  linkExternal:
    "font-medium text-emerald-400 underline decoration-emerald-700/70 underline-offset-2 hover:text-emerald-300",

  heading1: "text-4xl font-bold tracking-tight text-zinc-50",
  heading2: "text-2xl font-semibold text-zinc-50",
  heading3: "text-xl font-semibold text-zinc-50",
  workdir: "font-mono text-base text-fg-faint",
  introAside: "border-l-2 border-accent-stroke pl-5",

  /** Spacing above the collapsible module summary card (above questions). */
  moduleSummarySection: "mt-10 space-y-4",

  panel:
    "rounded-xl border border-stroke bg-surface-raised/35 p-6 text-lg shadow-sm shadow-black/20",
  /** panel variant used as a block link — adds hover border/bg lift and transition. */
  panelLink:
    "block hover:border-stroke-muted hover:bg-surface-raised/60 transition-colors",
  questionList: "space-y-4",
  questionAccordionTrigger:
    "flex w-full items-center gap-3 rounded-md px-1 py-2 text-left outline-none hover:bg-surface-raised/60 focus-visible:ring-2 focus-visible:ring-accent-stroke",
  questionAccordionChevron: "w-6 shrink-0 text-center text-fg-faint",
  questionAccordionBody: "mt-4 border-t border-stroke pt-4",
  muted: "text-base text-fg-muted",
  hint: "text-base text-fg-faint",

  fieldLabel:
    "mt-4 block text-sm font-semibold uppercase tracking-wide text-fg-faint",

  /** Shared textarea body; border/focus come from `labTextareaClasses(result)`. */
  textareaBase:
    "mt-1 w-full resize-y rounded-md bg-surface px-3 py-3 font-mono text-base leading-relaxed text-fg placeholder:text-fg-disabled focus:outline-none focus:ring-2",

  /** Generic field border/focus for non-answer inputs (tools, forms). */
  fieldBorder:
    "border border-stroke-muted focus:border-accent focus:ring-2 focus:ring-emerald-700/50",

  /** Single-line stdout / token answers; border/focus from `labLineInputClasses(result)`. */
  answerLineInput:
    "mt-1 w-full rounded-md bg-surface px-3 py-2.5 font-mono text-base leading-normal text-fg placeholder:text-fg-disabled focus:outline-none focus:ring-2",

  details: "mt-4 rounded-lg border border-stroke bg-surface/60 p-4 text-lg",
  detailsSummary:
    "cursor-pointer select-none text-lg font-medium text-fg-soft hover:text-fg",

  btnPrimary:
    "rounded-md bg-emerald-700 px-4 py-2.5 text-base font-medium text-white hover:bg-emerald-600 disabled:pointer-events-none disabled:cursor-wait disabled:opacity-55 disabled:hover:bg-emerald-700",
  /** Applied on top of btnGhost / btnGhostSm when the button represents the active page. */
  btnGhostActive: "bg-accent-surface/50 ring-1 ring-accent-stroke/80",

  btnGhost:
    "rounded-md border border-stroke-muted px-4 py-2.5 text-base text-zinc-200 hover:bg-surface-raised disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
  btnGhostSm:
    "rounded-md border border-zinc-600 px-4 py-2.5 text-base font-medium text-zinc-200 hover:bg-surface-raised disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
  btnDanger:
    "rounded-md bg-danger px-4 py-2.5 text-base font-semibold text-rose-100 ring-1 ring-danger hover:bg-danger-surface hover:text-danger-fg disabled:pointer-events-none disabled:cursor-wait disabled:opacity-55 disabled:hover:bg-danger disabled:hover:text-rose-100",

  badgeOk:
    "shrink-0 rounded-full bg-accent-surface px-3 py-1 text-sm font-medium text-emerald-300 ring-1 ring-accent-stroke",
  badgeBad:
    "shrink-0 rounded-full bg-danger-surface px-3 py-1 text-sm font-medium text-danger-fg ring-1 ring-danger",

  /** Error banner (parse errors, contradictions, etc.) */
  errorBanner:
    "rounded-lg border border-danger/60 bg-danger-surface/20 px-4 py-3",
  errorBannerText: "font-mono text-sm text-danger-fg",

  /** Data table element — used inside LabTable wrapper. */
  table:
    "w-full min-w-[28rem] border-collapse text-left text-base text-zinc-300",
  /** Data table header cell — shared between lab-setup and markdown summary tables. */
  tableTh:
    "border border-zinc-700 bg-zinc-900/80 px-3 py-2 font-semibold text-zinc-100",
  /** Data table body cell base — callers may append additional size/font classes. */
  tableTd: "border border-zinc-800 px-3 py-2",

  /** Small inline stat labels used in the per-module stats card. */
  statCorrect: "text-emerald-400",
  statIncorrect: "text-rose-300/80",
  statUnanswered: "text-fg-faint",
  /** Aggregate count label in the stats overview panel. */
  statsLabel: "text-sm text-fg-muted",

  /** Small danger-tinted reset button inside a card (not full btnDanger size). */
  btnDangerSm:
    "shrink-0 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-rose-900/70 hover:bg-rose-950/30 hover:text-rose-300",

  /** Inline code block — monospace preformatted content (e.g. accepted answers, command output). */
  codeBlock:
    "overflow-x-auto rounded-md bg-surface px-3 py-2 font-mono text-sm text-fg",

  modalBackdrop:
    "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 text-lg",
  modalCard:
    "w-full max-w-lg rounded-lg border border-stroke-muted bg-surface p-8 shadow-xl",
  modalTitle: "text-2xl font-semibold text-zinc-50",
  modalBody: "mt-3 text-base leading-relaxed text-fg-muted",
  modalActions: "mt-8 flex justify-end gap-3",
} as const;

function answerResultBorder(result: QuestionResult): string {
  if (result === "correct") {
    return "border-2 border-accent focus:border-emerald-400 focus:ring-emerald-500/45";
  }
  if (result === "incorrect") {
    return "border-2 border-danger focus:border-rose-800 focus:ring-rose-900/40";
  }
  return "border border-stroke-muted focus:border-accent focus:ring-emerald-700/50";
}

/** Multiline answer; border/focus reflect the last check when not idle. */
export function labTextareaClasses(result: QuestionResult): string {
  return `${lab.textareaBase} ${answerResultBorder(result)}`;
}

/** Single-line monospace answer; border/focus reflect the last check when not idle. */
export function labLineInputClasses(result: QuestionResult): string {
  return `${lab.answerLineInput} ${answerResultBorder(result)}`;
}
