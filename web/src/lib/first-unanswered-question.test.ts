import { describe, expect, it } from "vitest";
import { firstUnansweredQuestionIndex } from "./first-unanswered-question";
import type { LabTopic, ProgressFileV1 } from "./types";

function makeTopic(questions: { id: string }[]): LabTopic {
  return {
    id: "test-mod",
    title: "",
    shortTitle: "",
    workdir: "",
    intro: "",
    questions: questions.map((q) => ({
      id: q.id,
      prompt: "",
      expectedOutput: "",
      solutionMarkdown: "",
    })),
  };
}

const emptyProgress = (): ProgressFileV1 => ({ version: 1, modules: {} });

describe("firstUnansweredQuestionIndex", () => {
  it("returns 0 when there are no questions", () => {
    const topic = makeTopic([]);
    expect(firstUnansweredQuestionIndex(topic, emptyProgress())).toBe(0);
  });

  it("returns 0 when every question is still idle", () => {
    const topic = makeTopic([{ id: "q1" }, { id: "q2" }]);
    expect(firstUnansweredQuestionIndex(topic, emptyProgress())).toBe(0);
  });

  it("returns the first non-correct index (incorrect before later idle)", () => {
    const topic = makeTopic([{ id: "q1" }, { id: "q2" }, { id: "q3" }]);
    const progress: ProgressFileV1 = {
      version: 1,
      modules: {
        "test-mod": {
          questions: {
            q1: { draft: "", result: "correct", lastCheckedBody: "a" },
            q2: { draft: "", result: "incorrect", lastCheckedBody: "b" },
          },
        },
      },
    };
    expect(firstUnansweredQuestionIndex(topic, progress)).toBe(1);
  });

  it("returns 0 when an earlier question is incorrect", () => {
    const topic = makeTopic([{ id: "q1" }, { id: "q2" }]);
    const progress: ProgressFileV1 = {
      version: 1,
      modules: {
        "test-mod": {
          questions: {
            q1: { draft: "", result: "incorrect", lastCheckedBody: "x" },
          },
        },
      },
    };
    expect(firstUnansweredQuestionIndex(topic, progress)).toBe(0);
  });

  it("returns first idle after prior questions are correct", () => {
    const topic = makeTopic([{ id: "q1" }, { id: "q2" }, { id: "q3" }]);
    const progress: ProgressFileV1 = {
      version: 1,
      modules: {
        "test-mod": {
          questions: {
            q1: { draft: "", result: "correct", lastCheckedBody: "a" },
          },
        },
      },
    };
    expect(firstUnansweredQuestionIndex(topic, progress)).toBe(1);
  });

  it("returns 0 when all questions have been checked", () => {
    const topic = makeTopic([{ id: "q1" }, { id: "q2" }]);
    const progress: ProgressFileV1 = {
      version: 1,
      modules: {
        "test-mod": {
          questions: {
            q1: { draft: "", result: "correct", lastCheckedBody: "a" },
            q2: { draft: "", result: "correct", lastCheckedBody: "b" },
          },
        },
      },
    };
    expect(firstUnansweredQuestionIndex(topic, progress)).toBe(0);
  });
});
