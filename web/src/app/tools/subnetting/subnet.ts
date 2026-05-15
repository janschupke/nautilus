export type Version = "v4" | "v6";
export const BITS: Record<Version, number> = { v4: 32, v6: 128 };

export function bitmask(prefix: number, bits: number): bigint {
  if (prefix === 0) return 0n;
  return ((1n << BigInt(prefix)) - 1n) << BigInt(bits - prefix);
}

// ── IPv4 ──────────────────────────────────────────────────────────────────────

export function parseIPv4(ip: string): bigint | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let v = 0n;
  for (const p of parts) {
    const n = parseInt(p, 10);
    if (isNaN(n) || n < 0 || n > 255 || p.trim() === "") return null;
    v = (v << 8n) | BigInt(n);
  }
  return v;
}

export function formatIPv4(addr: bigint): string {
  return [24n, 16n, 8n, 0n]
    .map((s) => String((addr >> s) & 0xffn))
    .join(".");
}

function ipv4Class(addr: bigint): string {
  const first = Number((addr >> 24n) & 0xffn);
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D (multicast)";
  return "E (reserved)";
}

// ── IPv6 ──────────────────────────────────────────────────────────────────────

export function parseIPv6(ip: string): bigint | null {
  const s = ip.trim();
  let groups: string[];
  if (s.includes("::")) {
    const halves = s.split("::");
    if (halves.length !== 2) return null;
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const fill = 8 - left.length - right.length;
    if (fill < 0) return null;
    groups = [...left, ...Array(fill).fill("0"), ...right];
  } else {
    groups = s.split(":");
  }
  if (groups.length !== 8) return null;
  let v = 0n;
  for (const g of groups) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
    v = (v << 16n) | BigInt(parseInt(g, 16));
  }
  return v;
}

export function formatIPv6(addr: bigint): string {
  const g: string[] = [];
  for (let i = 7; i >= 0; i--)
    g.push(((addr >> BigInt(i * 16)) & 0xffffn).toString(16));

  let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (g[i] === "0") {
      if (curStart < 0) { curStart = i; curLen = 1; }
      else curLen++;
      if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
    } else {
      curStart = -1; curLen = 0;
    }
  }

  if (bestLen < 2) return g.join(":");
  return g.slice(0, bestStart).join(":") + "::" + g.slice(bestStart + bestLen).join(":");
}

// ── CIDR parser ───────────────────────────────────────────────────────────────

export function parseCIDR(
  cidr: string,
  version: Version,
): { addr: bigint; prefix: number } | string {
  const slash = cidr.lastIndexOf("/");
  if (slash < 0) return `Enter in CIDR notation, e.g. ${version === "v4" ? "10.0.0.0/8" : "2001:db8::/32"}`;
  const ipPart = cidr.slice(0, slash).trim();
  const prefixPart = cidr.slice(slash + 1).trim();
  const maxPrefix = BITS[version];
  const prefix = parseInt(prefixPart, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > maxPrefix)
    return `Prefix must be 0–${maxPrefix}`;
  const addr = version === "v4" ? parseIPv4(ipPart) : parseIPv6(ipPart);
  if (addr === null)
    return `Invalid ${version === "v4" ? "IPv4" : "IPv6"} address`;
  return { addr, prefix };
}

// ── Info calculation ──────────────────────────────────────────────────────────

export type InfoResult = {
  cidr: string;
  network: string;
  first: string;
  last: string;
  broadcast?: string;
  mask?: string;
  wildcard?: string;
  ipClass?: string;
  total: string;
  usable: string;
  prefix: number;
};

export function calcInfo(cidr: string, version: Version): InfoResult | string {
  const parsed = parseCIDR(cidr, version);
  if (typeof parsed === "string") return parsed;
  const { addr, prefix } = parsed;
  const bits = BITS[version];
  const m = bitmask(prefix, bits);
  const net = addr & m;
  const wildcard = ~m & ((1n << BigInt(bits)) - 1n);
  const last = net | wildcard;
  const total = 1n << BigInt(bits - prefix);
  const fmt = version === "v4" ? formatIPv4 : formatIPv6;

  if (version === "v4") {
    const usable = prefix >= 31 ? total : total > 2n ? total - 2n : 0n;
    return {
      cidr: `${fmt(net)}/${prefix}`,
      network: fmt(net),
      first: fmt(prefix >= 31 ? net : net + 1n),
      last: fmt(prefix >= 31 ? last : last - 1n),
      broadcast: prefix >= 31 ? "N/A" : fmt(last),
      mask: fmt(m),
      wildcard: fmt(wildcard),
      ipClass: ipv4Class(addr),
      total: total.toLocaleString(),
      usable: usable.toLocaleString(),
      prefix,
    };
  }

  return {
    cidr: `${fmt(net)}/${prefix}`,
    network: fmt(net),
    first: fmt(net),
    last: fmt(last),
    total: total > 1_000_000_000_000n
      ? `2^${bits - prefix} (≈ ${(Number(total / 10n ** BigInt(String(total).length - 4)) / 1000).toFixed(1)}×10^${String(total).length - 1})`
      : total.toLocaleString(),
    usable: `2^${bits - prefix}`,
    prefix,
  };
}

// ── VLSM ──────────────────────────────────────────────────────────────────────

export type SubnetEntry = { id: string; name: string; hosts: string };

export type Allocation = {
  id: string;
  name: string;
  required: number;
  prefix: number;
  cidr: string;
  first: string;
  last: string;
  broadcast?: string;
  usable: bigint;
  error?: string;
};

export function minPrefixForHosts(required: number, bits: number, version: Version): number {
  const req = BigInt(required);
  for (let p = bits; p >= 0; p--) {
    const block = 1n << BigInt(bits - p);
    const usable = version === "v4" && p < 31 ? block - 2n : block;
    if (usable >= req) return p;
  }
  return 0;
}

export function vlsmAllocate(
  base: string,
  entries: SubnetEntry[],
  version: Version,
): Allocation[] | string {
  const parsed = parseCIDR(base, version);
  if (typeof parsed === "string") return parsed;
  const { addr, prefix: basePrefix } = parsed;
  const bits = BITS[version];
  const net = addr & bitmask(basePrefix, bits);
  const baseEnd = net | (~bitmask(basePrefix, bits) & ((1n << BigInt(bits)) - 1n));
  const fmt = version === "v4" ? formatIPv4 : formatIPv6;

  const valid = entries
    .map((e) => ({ ...e, req: parseInt(e.hosts, 10) }))
    .filter((e) => e.name.trim() && !isNaN(e.req) && e.req > 0);

  const sorted = [...valid].sort((a, b) => b.req - a.req);

  const results: Allocation[] = [];
  let current = net;

  for (const s of sorted) {
    const prefix = Math.max(basePrefix, minPrefixForHosts(s.req, bits, version));
    const blockSize = 1n << BigInt(bits - prefix);

    const rem = current % blockSize;
    const aligned = rem === 0n ? current : current + (blockSize - rem);

    if (aligned + blockSize - 1n > baseEnd) {
      results.push({
        id: s.id, name: s.name, required: s.req,
        prefix, cidr: "—", first: "—", last: "—",
        usable: 0n, error: "Out of space in base network",
      });
      continue;
    }

    const broadcast = aligned + blockSize - 1n;
    const usable = version === "v4" && prefix < 31 ? blockSize - 2n : blockSize;
    const first = version === "v4" && prefix < 31 ? aligned + 1n : aligned;
    const last = version === "v4" && prefix < 31 ? broadcast - 1n : broadcast;

    results.push({
      id: s.id, name: s.name, required: s.req,
      prefix,
      cidr: `${fmt(aligned)}/${prefix}`,
      first: fmt(first),
      last: fmt(last),
      broadcast: version === "v4" && prefix < 31 ? fmt(broadcast) : undefined,
      usable,
    });

    current = aligned + blockSize;
  }

  return results;
}
