import { describe, expect, it } from "vitest";
import {
  moduleIdFromPathname,
  topicIdFromPathname,
  topicRouteFromPathname,
} from "./module-pathname";

// ── moduleIdFromPathname ──────────────────────────────────────────────────────

describe("moduleIdFromPathname", () => {
  it("returns null for non-module routes", () => {
    expect(moduleIdFromPathname(null)).toBeNull();
    expect(moduleIdFromPathname("/")).toBeNull();
    expect(moduleIdFromPathname("/stats")).toBeNull();
    expect(moduleIdFromPathname("/tools")).toBeNull();
  });

  it("returns null for two-segment paths", () => {
    expect(moduleIdFromPathname("/networking/02-curl")).toBeNull();
  });

  it("returns the moduleId for a known module", () => {
    expect(moduleIdFromPathname("/networking")).toBe("networking");
    expect(moduleIdFromPathname("/basics")).toBe("basics");
    expect(moduleIdFromPathname("/linux-fundamentals")).toBe("linux-fundamentals");
  });

  it("accepts a trailing slash", () => {
    expect(moduleIdFromPathname("/forensics/")).toBe("forensics");
  });
});

// ── topicRouteFromPathname ────────────────────────────────────────────────────

describe("topicRouteFromPathname", () => {
  it("returns null for non-topic routes", () => {
    expect(topicRouteFromPathname(null)).toBeNull();
    expect(topicRouteFromPathname("/")).toBeNull();
    expect(topicRouteFromPathname("/networking")).toBeNull();
    expect(topicRouteFromPathname("/stats")).toBeNull();
  });

  it("returns null when moduleId is not a known module", () => {
    expect(topicRouteFromPathname("/tools/something")).toBeNull();
    expect(topicRouteFromPathname("/unknown/02-curl")).toBeNull();
  });

  it("parses moduleId and topicId", () => {
    expect(topicRouteFromPathname("/networking/02-curl")).toEqual({
      moduleId: "networking",
      topicId: "02-curl",
    });
  });

  it("accepts a trailing slash", () => {
    expect(topicRouteFromPathname("/basics/05-awk/")).toEqual({
      moduleId: "basics",
      topicId: "05-awk",
    });
  });

  it("decodes URI-encoded segments", () => {
    expect(topicRouteFromPathname("/networking/foo%2Fbar")).toEqual({
      moduleId: "networking",
      topicId: "foo/bar",
    });
  });
});

// ── topicIdFromPathname ───────────────────────────────────────────────────────

describe("topicIdFromPathname", () => {
  it("returns null for non-topic routes", () => {
    expect(topicIdFromPathname(null)).toBeNull();
    expect(topicIdFromPathname("/networking")).toBeNull();
    expect(topicIdFromPathname("/stats")).toBeNull();
  });

  it("returns the topicId for a topic route", () => {
    expect(topicIdFromPathname("/networking/02-curl")).toBe("02-curl");
    expect(topicIdFromPathname("/basics/05-awk")).toBe("05-awk");
  });
});
