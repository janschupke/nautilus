import { describe, expect, it } from "vitest";
import { formatModuleIndex } from "./format";

describe("formatModuleIndex", () => {
  it("formats index 0 as 01", () => {
    expect(formatModuleIndex(0)).toBe("01");
  });

  it("formats single-digit indices with leading zero", () => {
    expect(formatModuleIndex(4)).toBe("05");
    expect(formatModuleIndex(8)).toBe("09");
  });

  it("formats double-digit indices without padding", () => {
    expect(formatModuleIndex(9)).toBe("10");
    expect(formatModuleIndex(11)).toBe("12");
  });
});
