import type { LabAnswerFormat, LabQuestion } from "./types";

export type { LabAnswerFormat } from "./types";

/** Above this length, a single-line expected answer still uses a textarea (URLs, prose). */
const MULTILINE_SINGLE_LINE_CHAR_THRESHOLD = 220;

export function inferAnswerFormat(expectedOutput: string): LabAnswerFormat {
  const normalized = expectedOutput.replace(/\r\n/g, "\n");
  if (normalized.includes("\n")) return "multiline";
  if (normalized.length > MULTILINE_SINGLE_LINE_CHAR_THRESHOLD) {
    return "multiline";
  }
  return "line";
}

export function resolveAnswerFormat(question: LabQuestion): LabAnswerFormat {
  return question.answerFormat ?? inferAnswerFormat(question.expectedOutput);
}
