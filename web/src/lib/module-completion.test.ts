import { describe, expect, it } from "vitest";
import { LAB_MODULE_QUESTION_IDS } from "@/content/lab-module-question-ids";
import type { ProgressFileV1 } from "./types";
import {
  getTopicLabProgressCounts,
  isTopicFullyCorrect,
  topicHasAnswerChecks,
} from "./module-completion";

function allCorrectProgress(topicId: string): ProgressFileV1 {
  const qids = LAB_MODULE_QUESTION_IDS[topicId];
  if (!qids) throw new Error(`unknown topic ${topicId}`);
  const questions = Object.fromEntries(
    qids.map((id) => [
      id,
      { draft: "x", result: "correct" as const, lastCheckedBody: "x" },
    ]),
  );
  return { version: 1, modules: { [topicId]: { questions } } };
}

describe("getTopicLabProgressCounts", () => {
  it("returns null for unregistered topics", () => {
    expect(
      getTopicLabProgressCounts({ version: 1, modules: {} }, "99-unknown"),
    ).toBeNull();
  });

  it("counts only correct results", () => {
    const qids = LAB_MODULE_QUESTION_IDS["01-environment"]!;
    const questions: ProgressFileV1["modules"][string]["questions"] = {
      [qids[0]!]: {
        draft: "",
        result: "correct",
        lastCheckedBody: "a",
      },
      [qids[1]!]: {
        draft: "",
        result: "incorrect",
        lastCheckedBody: "b",
      },
    };
    for (let i = 2; i < qids.length; i++) {
      questions[qids[i]!] = {
        draft: "",
        result: "idle",
        lastCheckedBody: null,
      };
    }
    const progress: ProgressFileV1 = {
      version: 1,
      modules: { "01-environment": { questions } },
    };
    const counts = getTopicLabProgressCounts(progress, "01-environment");
    expect(counts).toEqual({
      correct: 1,
      total: qids.length,
    });
  });
});

describe("topicHasAnswerChecks", () => {
  const topicId = "01-environment";

  it("returns false when there is no progress for the topic", () => {
    expect(topicHasAnswerChecks({ version: 1, modules: {} }, topicId)).toBe(
      false,
    );
  });

  it("returns false when every question is still idle", () => {
    const qids = LAB_MODULE_QUESTION_IDS[topicId]!;
    const questions: ProgressFileV1["modules"][string]["questions"] =
      Object.fromEntries(
        qids.map((id) => [
          id,
          { draft: "", result: "idle" as const, lastCheckedBody: null },
        ]),
      );
    expect(
      topicHasAnswerChecks(
        { version: 1, modules: { [topicId]: { questions } } },
        topicId,
      ),
    ).toBe(false);
  });

  it("returns true when at least one question was checked correct", () => {
    const qids = LAB_MODULE_QUESTION_IDS[topicId]!;
    const questions: ProgressFileV1["modules"][string]["questions"] =
      Object.fromEntries(
        qids.map((id, i) => [
          id,
          i === 0
            ? {
                draft: "a",
                result: "correct" as const,
                lastCheckedBody: "a",
              }
            : { draft: "", result: "idle" as const, lastCheckedBody: null },
        ]),
      );
    expect(
      topicHasAnswerChecks(
        { version: 1, modules: { [topicId]: { questions } } },
        topicId,
      ),
    ).toBe(true);
  });

  it("returns true when at least one question was checked incorrect", () => {
    const qids = LAB_MODULE_QUESTION_IDS[topicId]!;
    const questions: ProgressFileV1["modules"][string]["questions"] =
      Object.fromEntries(
        qids.map((id, i) => [
          id,
          i === 0
            ? {
                draft: "b",
                result: "incorrect" as const,
                lastCheckedBody: "b",
              }
            : { draft: "", result: "idle" as const, lastCheckedBody: null },
        ]),
      );
    expect(
      topicHasAnswerChecks(
        { version: 1, modules: { [topicId]: { questions } } },
        topicId,
      ),
    ).toBe(true);
  });

  it("returns false for unregistered topic ids", () => {
    expect(
      topicHasAnswerChecks({ version: 1, modules: {} }, "99-unknown"),
    ).toBe(false);
  });
});

describe("isTopicFullyCorrect", () => {
  it("returns false when no progress exists", () => {
    const empty: ProgressFileV1 = { version: 1, modules: {} };
    expect(isTopicFullyCorrect(empty, "01-environment")).toBe(false);
  });

  it("returns false when any question is not correct", () => {
    const qids = LAB_MODULE_QUESTION_IDS["01-environment"]!;
    const questions: ProgressFileV1["modules"][string]["questions"] = {};
    for (const id of qids) {
      questions[id] = {
        draft: "",
        result: "correct",
        lastCheckedBody: "",
      };
    }
    questions[qids[0]!] = {
      draft: "",
      result: "incorrect",
      lastCheckedBody: "",
    };
    const progress: ProgressFileV1 = {
      version: 1,
      modules: { "01-environment": { questions } },
    };
    expect(isTopicFullyCorrect(progress, "01-environment")).toBe(false);
  });

  it("returns true when every question is correct", () => {
    const progress = allCorrectProgress("01-environment");
    expect(isTopicFullyCorrect(progress, "01-environment")).toBe(true);
  });

  it("returns false for unregistered topic ids", () => {
    expect(
      isTopicFullyCorrect({ version: 1, modules: {} }, "99-not-registered"),
    ).toBe(false);
  });
});
