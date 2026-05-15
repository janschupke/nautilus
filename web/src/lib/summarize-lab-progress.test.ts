import { describe, expect, it } from "vitest";
import type { ProgressFileV1 } from "./types";
import {
  summarizeLabProgress,
  summarizeModuleProgress,
  summarizeTopicProgress,
} from "./summarize-lab-progress";

const emptyProgress = (): ProgressFileV1 => ({ version: 1, modules: {} });

// ── summarizeTopicProgress ───────────────────────────────────────────────────

describe("summarizeTopicProgress", () => {
  const topic = {
    topicId: "t1",
    title: "Topic 1",
    questionIds: ["q1", "q2", "q3"],
  };

  it("counts all as unanswered when no progress exists", () => {
    expect(summarizeTopicProgress(emptyProgress(), topic)).toEqual({
      topicId: "t1",
      title: "Topic 1",
      total: 3,
      correct: 0,
      incorrect: 0,
      unanswered: 3,
    });
  });

  it("counts correct, incorrect, and unanswered independently", () => {
    const progress: ProgressFileV1 = {
      version: 1,
      modules: {
        t1: {
          questions: {
            q1: { draft: "a", result: "correct", lastCheckedBody: "a" },
            q2: { draft: "b", result: "incorrect", lastCheckedBody: "b" },
          },
        },
      },
    };
    expect(summarizeTopicProgress(progress, topic)).toEqual({
      topicId: "t1",
      title: "Topic 1",
      total: 3,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
    });
  });

  it("reports total equal to questionIds length", () => {
    const result = summarizeTopicProgress(emptyProgress(), topic);
    expect(result.total).toBe(topic.questionIds.length);
  });
});

// ── summarizeModuleProgress ──────────────────────────────────────────────────

describe("summarizeModuleProgress", () => {
  const mod = {
    moduleId: "m1",
    title: "Module 1",
    topics: [
      { topicId: "t1", title: "T1", questionIds: ["q1", "q2"] },
      { topicId: "t2", title: "T2", questionIds: ["q3"] },
    ],
  };

  it("returns zeros when no progress exists", () => {
    expect(summarizeModuleProgress(emptyProgress(), mod)).toEqual({
      moduleId: "m1",
      title: "Module 1",
      topicCount: 2,
      total: 3,
      correct: 0,
      incorrect: 0,
      unanswered: 3,
    });
  });

  it("aggregates counts across all topics", () => {
    const progress: ProgressFileV1 = {
      version: 1,
      modules: {
        t1: {
          questions: {
            q1: { draft: "a", result: "correct", lastCheckedBody: "a" },
            q2: { draft: "b", result: "incorrect", lastCheckedBody: "b" },
          },
        },
        t2: {
          questions: {
            q3: { draft: "c", result: "correct", lastCheckedBody: "c" },
          },
        },
      },
    };
    expect(summarizeModuleProgress(progress, mod)).toEqual({
      moduleId: "m1",
      title: "Module 1",
      topicCount: 2,
      total: 3,
      correct: 2,
      incorrect: 1,
      unanswered: 0,
    });
  });

  it("reports topicCount equal to topics array length", () => {
    const result = summarizeModuleProgress(emptyProgress(), mod);
    expect(result.topicCount).toBe(mod.topics.length);
  });
});

// ── summarizeLabProgress ─────────────────────────────────────────────────────

describe("summarizeLabProgress", () => {
  it("returns zeros for empty module list", () => {
    expect(summarizeLabProgress(emptyProgress(), [])).toEqual({
      moduleCount: 0,
      totalQuestions: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
    });
  });

  it("counts all unanswered when progress is empty", () => {
    const modules = [
      {
        moduleId: "m1",
        title: "m1",
        topics: [
          { topicId: "t1", title: "t1", questionIds: ["q1", "q2"] as const },
        ],
      },
      {
        moduleId: "m2",
        title: "m2",
        topics: [{ topicId: "t2", title: "t2", questionIds: ["a"] as const }],
      },
    ] as const;
    expect(summarizeLabProgress(emptyProgress(), modules)).toEqual({
      moduleCount: 2,
      totalQuestions: 3,
      correct: 0,
      incorrect: 0,
      unanswered: 3,
    });
  });

  it("aggregates results across modules", () => {
    const progress: ProgressFileV1 = {
      version: 1,
      modules: {
        t1: {
          questions: {
            q1: { draft: "", result: "correct", lastCheckedBody: "x" },
            q2: { draft: "", result: "incorrect", lastCheckedBody: "y" },
          },
        },
        t2: {
          questions: {
            a: { draft: "", result: "idle", lastCheckedBody: null },
          },
        },
      },
    };
    const modules = [
      {
        moduleId: "m1",
        title: "m1",
        topics: [{ topicId: "t1", title: "t1", questionIds: ["q1", "q2"] }],
      },
      {
        moduleId: "m2",
        title: "m2",
        topics: [{ topicId: "t2", title: "t2", questionIds: ["a"] }],
      },
    ];
    expect(summarizeLabProgress(progress, modules)).toEqual({
      moduleCount: 2,
      totalQuestions: 3,
      correct: 1,
      incorrect: 1,
      unanswered: 1,
    });
  });
});
