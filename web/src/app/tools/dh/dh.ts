export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 1n) return 0n;
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

export function parseBigInt(raw: string): bigint | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    const v = BigInt(s);
    return v > 0n ? v : null;
  } catch {
    return null;
  }
}

export type Params = {
  p: string; // prime modulus
  g: string; // generator
  a: string; // Shrimp private key
  b: string; // Crab private key
  A: string; // Shrimp public key  = g^a mod p
  B: string; // Crab public key   = g^b mod p
  s: string; // shared secret    = B^a mod p = A^b mod p
};

export type Derived = Partial<Record<keyof Params, bigint>>;

export function derive(raw: Params): { values: Derived; errors: string[] } {
  const known: Derived = {};
  const errors: string[] = [];

  for (const k of Object.keys(raw) as (keyof Params)[]) {
    const v = parseBigInt(raw[k]);
    if (v !== null) known[k] = v;
  }

  const has = (k: keyof Params) => known[k] !== undefined;
  const get = (k: keyof Params) => known[k]!;
  const set = (k: keyof Params, v: bigint) => {
    if (has(k) && get(k) !== v) {
      errors.push(`Contradiction: computed ${k} = ${v} but input says ${get(k)}`);
    } else {
      known[k] = v;
    }
  };

  if (has("p") && get("p") < 2n) errors.push("p must be ≥ 2");
  if (has("g") && get("g") < 1n) errors.push("g must be ≥ 1");

  if (has("p") && has("g") && has("a")) set("A", modPow(get("g"), get("a"), get("p")));
  if (has("p") && has("g") && has("b")) set("B", modPow(get("g"), get("b"), get("p")));
  if (has("p") && has("B") && has("a")) set("s", modPow(get("B"), get("a"), get("p")));
  if (has("p") && has("A") && has("b")) set("s", modPow(get("A"), get("b"), get("p")));

  return { values: known, errors };
}
