import { describe, expect, it } from "vitest";
import { findModuleIdForTopic } from "./manifest";

describe("findModuleIdForTopic", () => {
  it("returns the module id for topics in each group", () => {
    expect(findModuleIdForTopic("01-environment")).toBe("basics");
    expect(findModuleIdForTopic("02-fhs")).toBe("filesystem");
    expect(findModuleIdForTopic("08-grep")).toBe("basics");
    expect(findModuleIdForTopic("03-wget")).toBe("networking");
    expect(findModuleIdForTopic("09-logs")).toBe("basics");
    expect(findModuleIdForTopic("01-nmap")).toBe("exploitation");
    expect(findModuleIdForTopic("01-artifacts")).toBe("forensics");
  });

  it("returns null for unknown ids", () => {
    expect(findModuleIdForTopic("99-not-a-topic")).toBeNull();
    expect(findModuleIdForTopic("")).toBeNull();
  });
});
