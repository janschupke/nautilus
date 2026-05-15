import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProgressFileV1 } from "./types";
import {
  clearAllProgress,
  clearTopicProgress,
  clearTopicsProgress,
  getQuestionState,
  isTopicSummaryCollapsed,
  loadProgress,
  saveProgress,
  saveSidebarModules,
  loadSidebarModules,
  setQuestionDraft,
  setQuestionResult,
  setTopicSummaryCollapsed,
  toggleSidebarModuleCollapsed,
} from "./storage";

// ── localStorage mock ───────────────────────────────────────────────────────

function mockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(k) {
      return map.has(k) ? map.get(k)! : null;
    },
    setItem(k, v) {
      map.set(k, String(v));
    },
    removeItem(k) {
      map.delete(k);
    },
    key(i) {
      return [...map.keys()][i] ?? null;
    },
  };
}

beforeEach(() => {
  vi.stubGlobal("window", {
    localStorage: mockStorage(),
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Helpers ─────────────────────────────────────────────────────────────────

const empty = (): ProgressFileV1 => ({ version: 1, modules: {} });

// ── getQuestionState ─────────────────────────────────────────────────────────

describe("getQuestionState", () => {
  it("returns idle empty state when no data exists", () => {
    expect(getQuestionState(empty(), "topic-a", "q1")).toEqual({
      draft: "",
      result: "idle",
      lastCheckedBody: null,
    });
  });

  it("returns stored state when it exists", () => {
    const state: ProgressFileV1 = {
      version: 1,
      modules: {
        "topic-a": {
          questions: {
            q1: {
              draft: "my answer",
              result: "correct",
              lastCheckedBody: "my answer",
            },
          },
        },
      },
    };
    expect(getQuestionState(state, "topic-a", "q1")).toEqual({
      draft: "my answer",
      result: "correct",
      lastCheckedBody: "my answer",
    });
  });

  it("returns empty state for an unknown question in a known topic", () => {
    const state: ProgressFileV1 = {
      version: 1,
      modules: { "topic-a": { questions: {} } },
    };
    expect(getQuestionState(state, "topic-a", "q99")).toEqual({
      draft: "",
      result: "idle",
      lastCheckedBody: null,
    });
  });
});

// ── setQuestionDraft ─────────────────────────────────────────────────────────

describe("setQuestionDraft", () => {
  it("creates the topic and question entries when absent", () => {
    const next = setQuestionDraft(empty(), "topic-a", "q1", "hello");
    expect(next.modules["topic-a"]?.questions["q1"]?.draft).toBe("hello");
  });

  it("updates only the draft, preserving result and lastCheckedBody", () => {
    const state: ProgressFileV1 = {
      version: 1,
      modules: {
        "topic-a": {
          questions: {
            q1: { draft: "old", result: "correct", lastCheckedBody: "old" },
          },
        },
      },
    };
    const next = setQuestionDraft(state, "topic-a", "q1", "new");
    expect(next.modules["topic-a"]?.questions["q1"]).toEqual({
      draft: "new",
      result: "correct",
      lastCheckedBody: "old",
    });
  });

  it("does not mutate the original state", () => {
    const orig = empty();
    setQuestionDraft(orig, "topic-a", "q1", "x");
    expect(orig.modules).toEqual({});
  });
});

// ── setQuestionResult ────────────────────────────────────────────────────────

describe("setQuestionResult", () => {
  it("stores correct result with body", () => {
    const next = setQuestionResult(
      empty(),
      "topic-a",
      "q1",
      "answer",
      "correct",
    );
    expect(next.modules["topic-a"]?.questions["q1"]).toEqual({
      draft: "answer",
      result: "correct",
      lastCheckedBody: "answer",
    });
  });

  it("stores incorrect result with body", () => {
    const next = setQuestionResult(
      empty(),
      "topic-a",
      "q1",
      "wrong",
      "incorrect",
    );
    expect(next.modules["topic-a"]?.questions["q1"]?.result).toBe("incorrect");
  });

  it("does not mutate the original state", () => {
    const orig = empty();
    setQuestionResult(orig, "topic-a", "q1", "x", "correct");
    expect(orig.modules).toEqual({});
  });
});

// ── saveProgress / loadProgress ──────────────────────────────────────────────

describe("saveProgress / loadProgress", () => {
  it("round-trips progress through localStorage", () => {
    const state: ProgressFileV1 = {
      version: 1,
      modules: {
        t1: {
          questions: {
            q1: { draft: "a", result: "correct", lastCheckedBody: "a" },
          },
        },
      },
    };
    saveProgress(state);
    expect(loadProgress()).toEqual(state);
  });

  it("returns empty progress when nothing is stored", () => {
    expect(loadProgress()).toEqual({ version: 1, modules: {} });
  });
});

// ── clearAllProgress ──────────────────────────────────────────────────────────

describe("clearAllProgress", () => {
  it("removes all stored progress", () => {
    saveProgress({ version: 1, modules: { t1: { questions: {} } } });
    clearAllProgress();
    expect(loadProgress()).toEqual({ version: 1, modules: {} });
  });
});

// ── clearTopicProgress ───────────────────────────────────────────────────────

describe("clearTopicProgress", () => {
  it("removes only the specified topic", () => {
    saveProgress({
      version: 1,
      modules: {
        t1: {
          questions: {
            q1: { draft: "a", result: "correct", lastCheckedBody: "a" },
          },
        },
        t2: {
          questions: {
            q2: { draft: "b", result: "idle", lastCheckedBody: null },
          },
        },
      },
    });
    clearTopicProgress("t1");
    const result = loadProgress();
    expect(result.modules["t1"]).toBeUndefined();
    expect(result.modules["t2"]).toBeDefined();
  });

  it("is a no-op for an unknown topic id", () => {
    const state: ProgressFileV1 = {
      version: 1,
      modules: { t1: { questions: {} } },
    };
    saveProgress(state);
    clearTopicProgress("t99");
    expect(loadProgress()).toEqual(state);
  });
});

// ── clearTopicsProgress ──────────────────────────────────────────────────────

describe("clearTopicsProgress", () => {
  it("removes all specified topics in one write", () => {
    saveProgress({
      version: 1,
      modules: {
        t1: { questions: {} },
        t2: { questions: {} },
        t3: { questions: {} },
      },
    });
    clearTopicsProgress(["t1", "t3"]);
    const result = loadProgress();
    expect(result.modules["t1"]).toBeUndefined();
    expect(result.modules["t3"]).toBeUndefined();
    expect(result.modules["t2"]).toBeDefined();
  });
});

// ── isTopicSummaryCollapsed / setTopicSummaryCollapsed ───────────────────────

describe("isTopicSummaryCollapsed / setTopicSummaryCollapsed", () => {
  it("returns false when nothing is stored", () => {
    expect(isTopicSummaryCollapsed("01-shell")).toBe(false);
  });

  it("returns true after collapsing a topic", () => {
    setTopicSummaryCollapsed("01-shell", true);
    expect(isTopicSummaryCollapsed("01-shell")).toBe(true);
  });

  it("returns false after expanding a previously collapsed topic", () => {
    setTopicSummaryCollapsed("01-shell", true);
    setTopicSummaryCollapsed("01-shell", false);
    expect(isTopicSummaryCollapsed("01-shell")).toBe(false);
  });

  it("collapses one topic without affecting others", () => {
    setTopicSummaryCollapsed("01-shell", true);
    expect(isTopicSummaryCollapsed("02-file-hex")).toBe(false);
  });
});

// ── saveSidebarModules / loadSidebarModules ──────────────────────────────────

describe("saveSidebarModules / loadSidebarModules", () => {
  it("round-trips the collapsed list", () => {
    saveSidebarModules({ version: 1, collapsed: ["basics", "networking"] });
    expect(loadSidebarModules()).toEqual({
      version: 1,
      collapsed: ["basics", "networking"],
    });
  });

  it("deduplicates and sorts on save", () => {
    saveSidebarModules({
      version: 1,
      collapsed: ["networking", "basics", "networking"],
    });
    expect(loadSidebarModules().collapsed).toEqual(["basics", "networking"]);
  });
});

// ── toggleSidebarModuleCollapsed ─────────────────────────────────────────────

describe("toggleSidebarModuleCollapsed", () => {
  it("adds a module to collapsed when it was not collapsed", () => {
    saveSidebarModules({ version: 1, collapsed: [] });
    toggleSidebarModuleCollapsed("basics");
    expect(loadSidebarModules().collapsed).toContain("basics");
  });

  it("removes a module from collapsed when it was collapsed", () => {
    saveSidebarModules({ version: 1, collapsed: ["basics"] });
    toggleSidebarModuleCollapsed("basics");
    expect(loadSidebarModules().collapsed).not.toContain("basics");
  });

  it("does not affect other collapsed modules", () => {
    saveSidebarModules({ version: 1, collapsed: ["networking"] });
    toggleSidebarModuleCollapsed("basics");
    expect(loadSidebarModules().collapsed).toContain("networking");
  });
});
