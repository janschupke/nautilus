import { describe, expect, it } from "vitest";
import type { ProgressFileV1 } from "./types";
import {
  loadHotkeys,
  parseHotkeysRaw,
  parseProgressRaw,
  parseSidebarModulesRaw,
  readHotkeysSnapshot,
  setHotkeysEnabled,
} from "./storage";

describe("parseProgressRaw", () => {
  it("returns empty progress for null or empty string", () => {
    expect(parseProgressRaw(null)).toEqual({ version: 1, modules: {} });
    expect(parseProgressRaw("")).toEqual({ version: 1, modules: {} });
  });

  it("returns empty progress for invalid JSON", () => {
    expect(parseProgressRaw("{not json")).toEqual({ version: 1, modules: {} });
  });

  it("returns empty progress when version is not 1", () => {
    expect(
      parseProgressRaw(JSON.stringify({ version: 2, modules: {} })),
    ).toEqual({
      version: 1,
      modules: {},
    });
  });

  it("accepts valid v1 payload", () => {
    const payload: ProgressFileV1 = {
      version: 1,
      modules: {
        m1: {
          questions: {
            q1: { draft: "x", result: "idle", lastCheckedBody: null },
          },
        },
      },
    };
    expect(parseProgressRaw(JSON.stringify(payload))).toEqual(payload);
  });
});

describe("parseSidebarModulesRaw", () => {
  it("returns empty collapsed for null or empty string", () => {
    expect(parseSidebarModulesRaw(null)).toEqual({
      version: 1,
      collapsed: [],
    });
    expect(parseSidebarModulesRaw("")).toEqual({
      version: 1,
      collapsed: [],
    });
  });

  it("returns empty collapsed for invalid JSON", () => {
    expect(parseSidebarModulesRaw("{not json")).toEqual({
      version: 1,
      collapsed: [],
    });
  });

  it("returns empty collapsed when version is not 1", () => {
    expect(
      parseSidebarModulesRaw(JSON.stringify({ version: 2, collapsed: ["a"] })),
    ).toEqual({ version: 1, collapsed: [] });
  });

  it("filters non-strings and dedupes", () => {
    expect(
      parseSidebarModulesRaw(
        JSON.stringify({
          version: 1,
          collapsed: ["b", "a", "b", 3, null],
        }),
      ),
    ).toEqual({ version: 1, collapsed: ["a", "b"] });
  });

  it("accepts valid v1 payload", () => {
    expect(
      parseSidebarModulesRaw(
        JSON.stringify({ version: 1, collapsed: ["basics"] }),
      ),
    ).toEqual({ version: 1, collapsed: ["basics"] });
  });
});

describe("parseHotkeysRaw", () => {
  it("defaults to enabled when nothing is stored", () => {
    // Shortcuts ship on; only an explicit opt-out disables them.
    expect(parseHotkeysRaw(null)).toEqual({ version: 1, enabled: true });
    expect(parseHotkeysRaw("")).toEqual({ version: 1, enabled: true });
  });

  it("defaults to enabled for corrupt or mis-versioned payloads", () => {
    expect(parseHotkeysRaw("{not json")).toEqual({ version: 1, enabled: true });
    expect(
      parseHotkeysRaw(JSON.stringify({ version: 2, enabled: false })),
    ).toEqual({ version: 1, enabled: true });
    expect(
      parseHotkeysRaw(JSON.stringify({ version: 1, enabled: "no" })),
    ).toEqual({ version: 1, enabled: true });
  });

  it("round-trips an explicit opt-out", () => {
    setHotkeysEnabled(false);
    expect(loadHotkeys()).toEqual({ version: 1, enabled: false });
    expect(parseHotkeysRaw(readHotkeysSnapshot())).toEqual({
      version: 1,
      enabled: false,
    });

    setHotkeysEnabled(true);
    expect(loadHotkeys()).toEqual({ version: 1, enabled: true });
  });
});
