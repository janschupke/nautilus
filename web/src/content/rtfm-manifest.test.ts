import { describe, expect, it } from "vitest";
import { findCheatsheet, RTFM_MANIFEST } from "./rtfm-manifest";

describe("RTFM_MANIFEST", () => {
  it("every entry has a non-empty slug, title and description", () => {
    for (const sheet of RTFM_MANIFEST) {
      expect(sheet.slug.length).toBeGreaterThan(0);
      expect(sheet.title.length).toBeGreaterThan(0);
      expect(sheet.description.length).toBeGreaterThan(0);
    }
  });

  it("slugs are unique", () => {
    const slugs = RTFM_MANIFEST.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("findCheatsheet", () => {
  it("returns the matching entry by slug", () => {
    const first = RTFM_MANIFEST[0]!;
    expect(findCheatsheet(first.slug)).toStrictEqual(first);
  });

  it("returns undefined for an unknown slug", () => {
    expect(findCheatsheet("does-not-exist")).toBeUndefined();
  });

  it("returns undefined for an empty slug", () => {
    expect(findCheatsheet("")).toBeUndefined();
  });
});
