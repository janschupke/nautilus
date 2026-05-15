import { describe, expect, it } from "vitest";
import { inferAnswerFormat, resolveAnswerFormat } from "./lab-answer-format";
import type { LabQuestion } from "./types";

const baseQ = {
  id: "q1",
  prompt: "p",
  solutionMarkdown: "s",
} satisfies Omit<LabQuestion, "expectedOutput" | "answerFormat">;

describe("inferAnswerFormat", () => {
  it("returns multiline when expected output contains a newline", () => {
    expect(inferAnswerFormat("a\nb")).toBe("multiline");
    expect(inferAnswerFormat("a\r\nb")).toBe("multiline");
  });

  it("returns multiline for long single-line expected strings", () => {
    expect(inferAnswerFormat("x".repeat(221))).toBe("multiline");
  });

  it("returns line for short single-line expected strings", () => {
    expect(inferAnswerFormat("750")).toBe("line");
    expect(inferAnswerFormat("rw-r-----")).toBe("line");
  });
});

describe("resolveAnswerFormat", () => {
  it("respects explicit answerFormat on the question", () => {
    const q: LabQuestion = {
      ...baseQ,
      expectedOutput: "hi",
      answerFormat: "multiline",
    };
    expect(resolveAnswerFormat(q)).toBe("multiline");
  });
});
