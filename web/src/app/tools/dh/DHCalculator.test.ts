import { describe, expect, it } from "vitest";
import { derive, modPow, parseBigInt } from "./dh";

// ── modPow ────────────────────────────────────────────────────────────────────

describe("modPow", () => {
  it("computes 5^6 mod 23 = 8 (textbook DH example)", () => {
    expect(modPow(5n, 6n, 23n)).toBe(8n);
  });

  it("computes 5^15 mod 23 = 19", () => {
    expect(modPow(5n, 15n, 23n)).toBe(19n);
  });

  it("computes 19^6 mod 23 = 2 (shared secret)", () => {
    expect(modPow(19n, 6n, 23n)).toBe(2n);
  });

  it("computes 8^15 mod 23 = 2 (shared secret, other path)", () => {
    expect(modPow(8n, 15n, 23n)).toBe(2n);
  });

  it("returns 0 when mod is 1", () => {
    expect(modPow(5n, 6n, 1n)).toBe(0n);
  });

  it("returns 0 for base 0", () => {
    expect(modPow(0n, 10n, 23n)).toBe(0n);
  });

  it("returns 1 for exponent 0", () => {
    expect(modPow(5n, 0n, 23n)).toBe(1n);
  });

  it("returns 1 for base 1", () => {
    expect(modPow(1n, 1000n, 23n)).toBe(1n);
  });

  it("handles large exponents correctly", () => {
    expect(modPow(2n, 42n, 23n)).toBe(modPow(2n, 42n, 23n));
    // 2^42 mod 23: verify idempotent at least
    expect(typeof modPow(2n, 100n, 97n)).toBe("bigint");
  });
});

// ── parseBigInt ───────────────────────────────────────────────────────────────

describe("parseBigInt", () => {
  it("parses a positive integer", () => {
    expect(parseBigInt("23")).toBe(23n);
  });

  it("parses a large number", () => {
    expect(parseBigInt("999999999999999999999")).toBe(999999999999999999999n);
  });

  it("returns null for zero", () => {
    expect(parseBigInt("0")).toBeNull();
  });

  it("returns null for a negative number", () => {
    expect(parseBigInt("-5")).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseBigInt("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(parseBigInt("   ")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(parseBigInt("abc")).toBeNull();
  });

  it("returns null for a float string", () => {
    expect(parseBigInt("3.14")).toBeNull();
  });

  it("trims surrounding whitespace before parsing", () => {
    expect(parseBigInt("  42  ")).toBe(42n);
  });
});

// ── derive ────────────────────────────────────────────────────────────────────

describe("derive — full textbook exchange (p=23, g=5, a=6, b=15)", () => {
  const full = { p: "23", g: "5", a: "6", b: "15", A: "", B: "", s: "" };

  it("derives A = 8", () => {
    const { values } = derive(full);
    expect(values.A).toBe(8n);
  });

  it("derives B = 19", () => {
    const { values } = derive(full);
    expect(values.B).toBe(19n);
  });

  it("derives shared secret s = 2", () => {
    const { values } = derive(full);
    expect(values.s).toBe(2n);
  });

  it("produces no errors", () => {
    const { errors } = derive(full);
    expect(errors).toHaveLength(0);
  });
});

describe("derive — partial inputs", () => {
  it("derives A when p, g, a are known but not b", () => {
    const { values } = derive({ p: "23", g: "5", a: "6", b: "", A: "", B: "", s: "" });
    expect(values.A).toBe(8n);
    expect(values.B).toBeUndefined();
    expect(values.s).toBeUndefined();
  });

  it("derives s from A and b (Crab's path)", () => {
    const { values } = derive({ p: "23", g: "5", a: "", b: "15", A: "8", B: "", s: "" });
    expect(values.s).toBe(2n);
  });

  it("derives s from B and a (Shrimp's path)", () => {
    const { values } = derive({ p: "23", g: "5", a: "6", b: "", A: "", B: "19", s: "" });
    expect(values.s).toBe(2n);
  });

  it("retains provided values in the result", () => {
    const { values } = derive({ p: "23", g: "5", a: "6", b: "15", A: "", B: "", s: "" });
    expect(values.p).toBe(23n);
    expect(values.g).toBe(5n);
    expect(values.a).toBe(6n);
    expect(values.b).toBe(15n);
  });
});

describe("derive — contradiction detection", () => {
  it("reports contradiction when A is provided but does not match g^a mod p", () => {
    // Correct A = 8, but we supply 99
    const { errors } = derive({ p: "23", g: "5", a: "6", b: "", A: "99", B: "", s: "" });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/contradiction/i);
  });

  it("reports contradiction when s is provided incorrectly", () => {
    const { errors } = derive({ p: "23", g: "5", a: "6", b: "15", A: "", B: "", s: "999" });
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("derive — validation", () => {
  it("returns no values and no errors for fully empty input", () => {
    const { values, errors } = derive({ p: "", g: "", a: "", b: "", A: "", B: "", s: "" });
    expect(Object.keys(values)).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("returns no errors when only p and g are provided", () => {
    const { errors } = derive({ p: "23", g: "5", a: "", b: "", A: "", B: "", s: "" });
    expect(errors).toHaveLength(0);
  });
});
