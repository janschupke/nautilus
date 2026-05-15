import { describe, expect, it } from "vitest";
import {
  countKeys,
  countLines,
  parseJSON,
  repairJSON,
} from "./json";

// ── parseJSON ─────────────────────────────────────────────────────────────────

describe("parseJSON", () => {
  it("parses a valid object", () => {
    const r = parseJSON('{"a":1,"b":true}');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual({ a: 1, b: true });
  });

  it("parses a valid array", () => {
    const r = parseJSON("[1,2,3]");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([1, 2, 3]);
  });

  it("parses null", () => {
    const r = parseJSON("null");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeNull();
  });

  it("returns ok:false for invalid JSON", () => {
    expect(parseJSON("{bad}").ok).toBe(false);
  });

  it("returns ok:false for unquoted key", () => {
    expect(parseJSON("{key:1}").ok).toBe(false);
  });

  it("includes an error message on failure", () => {
    const r = parseJSON("{bad}");
    if (!r.ok) expect(r.message.length).toBeGreaterThan(0);
  });
});

// ── repairJSON ────────────────────────────────────────────────────────────────

describe("repairJSON — trailing commas", () => {
  it("removes trailing comma in object", () => {
    const fixed = repairJSON('{"a":1,}');
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ a: 1 });
  });

  it("removes trailing comma in array", () => {
    const fixed = repairJSON("[1,2,3,]");
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual([1, 2, 3]);
  });

  it("removes trailing comma before nested closing brace", () => {
    const fixed = repairJSON('{"a":{"b":1,},}');
    expect(parseJSON(fixed).ok).toBe(true);
  });
});

describe("repairJSON — single quotes", () => {
  it("converts single-quoted string values to double-quoted", () => {
    const fixed = repairJSON("{'key':'value'}");
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ key: "value" });
  });

  it("preserves double quotes inside single-quoted strings", () => {
    const fixed = repairJSON(`{'say':'"hello"'}`);
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ say: '"hello"' });
  });

  it("handles escaped single quotes inside single-quoted strings", () => {
    const fixed = repairJSON(`{'it\\'s':'ok'}`);
    expect(parseJSON(fixed).ok).toBe(true);
  });
});

describe("repairJSON — Python / JS literals", () => {
  it("replaces True with true", () => {
    const fixed = repairJSON('{"v":True}');
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ v: true });
  });

  it("replaces False with false", () => {
    const fixed = repairJSON('{"v":False}');
    expect(JSON.parse(fixed)).toEqual({ v: false });
  });

  it("replaces None with null", () => {
    const fixed = repairJSON('{"v":None}');
    expect(JSON.parse(fixed)).toEqual({ v: null });
  });

  it("replaces undefined with null", () => {
    const fixed = repairJSON('{"v":undefined}');
    expect(JSON.parse(fixed)).toEqual({ v: null });
  });
});

describe("repairJSON — comments", () => {
  it("strips single-line // comments", () => {
    const fixed = repairJSON('{"a":1 // comment\n}');
    expect(parseJSON(fixed).ok).toBe(true);
  });

  it("strips block /* */ comments", () => {
    const fixed = repairJSON('{"a":/* x */1}');
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ a: 1 });
  });

  it("does not strip // inside a string value", () => {
    const fixed = repairJSON('{"url":"http://example.com"}');
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ url: "http://example.com" });
  });
});

describe("repairJSON — unquoted keys", () => {
  it("adds double quotes around bare identifier keys", () => {
    const fixed = repairJSON("{key:1}");
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ key: 1 });
  });

  it("handles camelCase keys", () => {
    const fixed = repairJSON("{myKey:true}");
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ myKey: true });
  });
});

describe("repairJSON — unbalanced braces", () => {
  it("closes a missing object brace", () => {
    const fixed = repairJSON('{"a":1');
    expect(parseJSON(fixed).ok).toBe(true);
  });

  it("closes a missing array bracket", () => {
    const fixed = repairJSON("[1,2,3");
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual([1, 2, 3]);
  });

  it("closes nested missing braces in correct order", () => {
    const fixed = repairJSON('{"a":[1,2');
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ a: [1, 2] });
  });
});

describe("repairJSON — combined", () => {
  it("repairs trailing commas + single quotes together", () => {
    const fixed = repairJSON("{'a':1,'b':2,}");
    expect(parseJSON(fixed).ok).toBe(true);
    expect(JSON.parse(fixed)).toEqual({ a: 1, b: 2 });
  });

  it("already-valid JSON is returned unchanged by parse", () => {
    const input = '{"a":1}';
    const fixed = repairJSON(input);
    expect(JSON.parse(fixed)).toEqual({ a: 1 });
  });
});

// ── countLines ────────────────────────────────────────────────────────────────

describe("countLines", () => {
  it("returns 0 for empty string", () => {
    expect(countLines("")).toBe(0);
  });

  it("returns 1 for a single line", () => {
    expect(countLines("hello")).toBe(1);
  });

  it("returns N for N newline-separated lines", () => {
    expect(countLines("a\nb\nc")).toBe(3);
  });
});

// ── countKeys ─────────────────────────────────────────────────────────────────

describe("countKeys", () => {
  it("counts object keys", () => {
    expect(countKeys({ a: 1, b: 2, c: 3 })).toBe(3);
  });

  it("counts array items", () => {
    expect(countKeys([10, 20, 30])).toBe(3);
  });

  it("returns 0 for null", () => {
    expect(countKeys(null)).toBe(0);
  });

  it("returns 0 for a primitive", () => {
    expect(countKeys("string")).toBe(0);
    expect(countKeys(42)).toBe(0);
    expect(countKeys(true)).toBe(0);
  });

  it("returns 0 for empty object", () => {
    expect(countKeys({})).toBe(0);
  });
});
