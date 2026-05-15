import { describe, expect, it } from "vitest";
import {
  bitmask,
  calcInfo,
  formatIPv4,
  formatIPv6,
  minPrefixForHosts,
  parseIPv4,
  parseIPv6,
  vlsmAllocate,
} from "./subnet";

// ── bitmask ───────────────────────────────────────────────────────────────────

describe("bitmask", () => {
  it("returns 0 for prefix 0", () => {
    expect(bitmask(0, 32)).toBe(0n);
  });

  it("returns all-ones for /32", () => {
    expect(bitmask(32, 32)).toBe(0xffff_ffffn);
  });

  it("returns correct mask for /24", () => {
    expect(bitmask(24, 32)).toBe(BigInt(0xffff_ff00));
  });

  it("returns correct mask for /16", () => {
    expect(bitmask(16, 32)).toBe(BigInt(0xffff_0000));
  });

  it("works for IPv6 /128", () => {
    expect(bitmask(128, 128)).toBe((1n << 128n) - 1n);
  });
});

// ── parseIPv4 ─────────────────────────────────────────────────────────────────

describe("parseIPv4", () => {
  it("parses a standard address", () => {
    expect(parseIPv4("192.168.1.1")).toBe(BigInt(0xc0a80101));
  });

  it("parses 0.0.0.0", () => {
    expect(parseIPv4("0.0.0.0")).toBe(0n);
  });

  it("parses 255.255.255.255", () => {
    expect(parseIPv4("255.255.255.255")).toBe(0xffff_ffffn);
  });

  it("returns null for an octet > 255", () => {
    expect(parseIPv4("256.0.0.0")).toBeNull();
  });

  it("returns null for too few octets", () => {
    expect(parseIPv4("192.168.1")).toBeNull();
  });

  it("returns null for non-numeric input", () => {
    expect(parseIPv4("not.an.ip.addr")).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    expect(parseIPv4("  10.0.0.1  ")).toBe(BigInt(0x0a000001));
  });
});

// ── formatIPv4 ────────────────────────────────────────────────────────────────

describe("formatIPv4", () => {
  it("formats 0 as 0.0.0.0", () => {
    expect(formatIPv4(0n)).toBe("0.0.0.0");
  });

  it("formats all-ones as 255.255.255.255", () => {
    expect(formatIPv4(0xffff_ffffn)).toBe("255.255.255.255");
  });

  it("round-trips parseIPv4 → formatIPv4", () => {
    const addr = "10.20.30.40";
    expect(formatIPv4(parseIPv4(addr)!)).toBe(addr);
  });
});

// ── parseIPv6 / formatIPv6 ────────────────────────────────────────────────────

describe("parseIPv6", () => {
  it("parses ::1 as 1", () => {
    expect(parseIPv6("::1")).toBe(1n);
  });

  it("parses :: as 0", () => {
    expect(parseIPv6("::")).toBe(0n);
  });

  it("parses a full-length address", () => {
    expect(parseIPv6("2001:0db8:0000:0000:0000:0000:0000:0001")).toBe(
      parseIPv6("2001:db8::1"),
    );
  });

  it("returns null for too many groups", () => {
    expect(parseIPv6("1:2:3:4:5:6:7:8:9")).toBeNull();
  });

  it("returns null for invalid hex characters", () => {
    expect(parseIPv6("gggg::1")).toBeNull();
  });
});

describe("formatIPv6", () => {
  it("formats 1 as ::1", () => {
    expect(formatIPv6(1n)).toBe("::1");
  });

  it("formats 0 as ::", () => {
    expect(formatIPv6(0n)).toBe("::");
  });

  it("compresses the longest run of zeros", () => {
    // fe80:0:0:0:0:0:0:1 → fe80::1
    const addr = parseIPv6("fe80::1")!;
    expect(formatIPv6(addr)).toBe("fe80::1");
  });

  it("round-trips parseIPv6 → formatIPv6 for loopback", () => {
    expect(formatIPv6(parseIPv6("::1")!)).toBe("::1");
  });
});

// ── calcInfo (IPv4) ───────────────────────────────────────────────────────────

describe("calcInfo — IPv4", () => {
  it("calculates /24 network correctly", () => {
    const r = calcInfo("192.168.1.0/24", "v4");
    expect(typeof r).toBe("object");
    if (typeof r === "object") {
      expect(r.network).toBe("192.168.1.0");
      expect(r.broadcast).toBe("192.168.1.255");
      expect(r.first).toBe("192.168.1.1");
      expect(r.last).toBe("192.168.1.254");
      expect(r.mask).toBe("255.255.255.0");
      expect(r.usable).toBe("254");
      expect(r.ipClass).toBe("C");
    }
  });

  it("masks the host bits to get the network address", () => {
    const r = calcInfo("192.168.1.42/24", "v4");
    if (typeof r === "object") expect(r.network).toBe("192.168.1.0");
  });

  it("handles /32 correctly (single host, N/A broadcast)", () => {
    const r = calcInfo("10.0.0.1/32", "v4");
    if (typeof r === "object") {
      expect(r.broadcast).toBe("N/A");
      expect(r.usable).toBe("1");
    }
  });

  it("handles /31 correctly (point-to-point, no broadcast)", () => {
    const r = calcInfo("10.0.0.0/31", "v4");
    if (typeof r === "object") expect(r.broadcast).toBe("N/A");
  });

  it("returns a string error for invalid input", () => {
    expect(typeof calcInfo("not-a-cidr", "v4")).toBe("string");
    expect(typeof calcInfo("192.168.1.0/33", "v4")).toBe("string");
  });

  it("identifies class A address", () => {
    const r = calcInfo("10.0.0.0/8", "v4");
    if (typeof r === "object") expect(r.ipClass).toBe("A");
  });

  it("identifies class B address", () => {
    const r = calcInfo("172.16.0.0/12", "v4");
    if (typeof r === "object") expect(r.ipClass).toBe("B");
  });
});

describe("calcInfo — IPv6", () => {
  it("calculates a /48 prefix", () => {
    const r = calcInfo("2001:db8::/48", "v6");
    expect(typeof r).toBe("object");
    if (typeof r === "object") {
      expect(r.network).toBe("2001:db8::");
      expect(r.prefix).toBe(48);
    }
  });

  it("returns an error for invalid IPv6 input", () => {
    expect(typeof calcInfo("invalid/64", "v6")).toBe("string");
  });
});

// ── minPrefixForHosts ─────────────────────────────────────────────────────────

describe("minPrefixForHosts", () => {
  it("returns /24 for 254 hosts (IPv4)", () => {
    expect(minPrefixForHosts(254, 32, "v4")).toBe(24);
  });

  it("returns /25 for 126 hosts (IPv4)", () => {
    expect(minPrefixForHosts(126, 32, "v4")).toBe(25);
  });

  it("returns /26 for 62 hosts (IPv4)", () => {
    expect(minPrefixForHosts(62, 32, "v4")).toBe(26);
  });

  it("returns /27 for 30 hosts (IPv4)", () => {
    expect(minPrefixForHosts(30, 32, "v4")).toBe(27);
  });

  it("returns /31 for 2 hosts (IPv4 point-to-point)", () => {
    expect(minPrefixForHosts(2, 32, "v4")).toBe(31);
  });

  it("returns /128 for 1 host (IPv6 single address)", () => {
    expect(minPrefixForHosts(1, 128, "v6")).toBe(128);
  });
});

// ── vlsmAllocate ──────────────────────────────────────────────────────────────

describe("vlsmAllocate", () => {
  const base = "192.168.0.0/24";
  const entries = [
    { id: "a", name: "Alpha", hosts: "50" },
    { id: "b", name: "Beta",  hosts: "25" },
    { id: "c", name: "Gamma", hosts: "12" },
  ];

  it("returns an array of allocations for valid input", () => {
    const result = vlsmAllocate(base, entries, "v4");
    expect(Array.isArray(result)).toBe(true);
  });

  it("allocates the correct number of subnets", () => {
    const result = vlsmAllocate(base, entries, "v4") as object[];
    expect(result).toHaveLength(3);
  });

  it("allocates largest subnet first (Alpha/50 → /26)", () => {
    const result = vlsmAllocate(base, entries, "v4") as Array<{
      name: string; cidr: string; prefix: number;
    }>;
    const alpha = result.find((r) => r.name === "Alpha")!;
    expect(alpha.prefix).toBe(26);
    expect(alpha.cidr).toBe("192.168.0.0/26");
  });

  it("allocates second subnet after the first block (Beta/25 → /27 at .64)", () => {
    const result = vlsmAllocate(base, entries, "v4") as Array<{
      name: string; cidr: string; prefix: number;
    }>;
    const beta = result.find((r) => r.name === "Beta")!;
    expect(beta.prefix).toBe(27);
    expect(beta.cidr).toBe("192.168.0.64/27");
  });

  it("allocates third subnet after second block (Gamma/12 → /28 at .96)", () => {
    const result = vlsmAllocate(base, entries, "v4") as Array<{
      name: string; cidr: string; prefix: number;
    }>;
    const gamma = result.find((r) => r.name === "Gamma")!;
    expect(gamma.prefix).toBe(28);
    expect(gamma.cidr).toBe("192.168.0.96/28");
  });

  it("marks an entry as errored when the base network is exhausted", () => {
    const tooMany = Array.from({ length: 6 }, (_, i) => ({
      id: String(i), name: `S${i}`, hosts: "60",
    }));
    const result = vlsmAllocate("10.0.0.0/24", tooMany, "v4") as Array<{
      error?: string;
    }>;
    expect(result.some((r) => r.error !== undefined)).toBe(true);
  });

  it("returns a string error for an invalid base network", () => {
    const result = vlsmAllocate("not-a-cidr", entries, "v4");
    expect(typeof result).toBe("string");
  });

  it("skips entries with empty names or invalid host counts", () => {
    const sparse = [
      { id: "1", name: "",      hosts: "10" },  // no name → skipped
      { id: "2", name: "Valid", hosts: "10" },
      { id: "3", name: "Bad",   hosts: "0" },   // 0 hosts → skipped
    ];
    const result = vlsmAllocate(base, sparse, "v4") as object[];
    expect(result).toHaveLength(1);
  });
});
