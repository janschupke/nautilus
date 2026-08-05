import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { findCheatsheet, RTFM_MANIFEST } from "./rtfm-manifest";

describe("RTFM_MANIFEST", () => {
  // The cheatsheet page has no heading of its own — the markdown supplies the
  // page's <h1>, so a sheet starting at "##" would leave the page without one.
  it("every cheatsheet markdown file starts with a level-1 heading", () => {
    for (const sheet of RTFM_MANIFEST) {
      const path = join(__dirname, "rtfm", `${sheet.slug}.md`);
      const firstLine = readFileSync(path, "utf8").trimStart().split("\n")[0];
      expect(firstLine, `${sheet.slug}.md`).toMatch(/^# \S/);
    }
  });

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
