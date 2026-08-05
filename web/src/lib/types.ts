export type LabAnswerFormat = "line" | "multiline";

export type LabQuestion = {
  id: string;
  prompt: string;
  /** Primary accepted answer (required). Used to infer the input format. */
  expectedOutput: string;
  /** Additional accepted answers — spelling variants, abbreviations, equivalent values, etc. */
  acceptedOutputs?: string[];
  solutionMarkdown: string;
  /** When set, forces line vs multiline answer control; otherwise inferred from `expectedOutput`. */
  answerFormat?: LabAnswerFormat;
  /** When true, answer comparison ignores case. Use only for questions where casing is irrelevant (e.g. yes/no). */
  caseInsensitive?: boolean;
};

export type LabTopic = {
  id: string;
  title: string;
  shortTitle: string;
  workdir: string;
  intro: string;
  /** Course `summary.md` (learning outcomes, scope, prerequisites, …). Markdown + GFM tables. */
  summaryMarkdown?: string;
  questions: LabQuestion[];
};

export type QuestionResult = "idle" | "correct" | "incorrect";

export type StoredQuestionState = {
  draft: string;
  result: QuestionResult;
  lastCheckedBody: string | null;
};

export type StoredTopicProgress = {
  questions: Record<string, StoredQuestionState>;
};

export type ProgressFileV1 = {
  version: 1;
  modules: Record<string, StoredTopicProgress>;
};

/** Which sidebar module sections are collapsed (`MANIFEST.modules[].id`). */
export type SidebarModulesFileV1 = {
  version: 1;
  collapsed: string[];
};

/**
 * Whether the single-key navigation shortcuts are active. WCAG 2.1.4 requires
 * unmodified character shortcuts to be switchable off; they stay on by default.
 */
export type HotkeysFileV1 = {
  version: 1;
  enabled: boolean;
};
