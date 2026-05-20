import type { LabAnswerFormat, LabQuestion } from "./types";
import { MULTILINE_SINGLE_LINE_CHAR_THRESHOLD } from "./constants";

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
