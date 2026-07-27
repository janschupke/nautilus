"use client";

import { useState } from "react";
import { parseBigInt, derive, type Params, type Derived } from "./dh";
import { lab } from "@/ui/lab";

const EXAMPLES: { label: string; params: Params }[] = [
  {
    label: "Textbook (p=23)",
    params: { p: "23", g: "5", a: "6", b: "15", A: "", B: "", s: "" },
  },
  {
    label: "RFC 3526 group 14 (partial)",
    params: {
      p: "32317006071311007300714876688669951960444102669715484032130345427524655138867890893197201411522913463688717960921898019494119559150490921095088152386448283120630877367300996091750197750389652106796057638384067568276792218642619756161838094338476170470581645852036305042887575891541065808607552399123930385521914333389668342420684974786564569494856176035326322058077805659331026192708460314150258592864177116725943603718461857357598351152301645904403697613233287231227125684710820170533863921",
      g: "2",
      a: "42",
      b: "",
      A: "",
      B: "",
      s: "",
    },
  },
];

const FIELD_META: { key: keyof Params; label: string; hint: string }[] = [
  { key: "p", label: "p — prime modulus", hint: "Large prime shared publicly" },
  {
    key: "g",
    label: "g — generator",
    hint: "Primitive root modulo p (shared publicly)",
  },
  {
    key: "a",
    label: "a — 🦐 Shrimp private key",
    hint: "Secret; only 🦐 Shrimp knows this",
  },
  {
    key: "b",
    label: "b — 🦀 Crab private key",
    hint: "Secret; only 🦀 Crab knows this",
  },
  {
    key: "A",
    label: "A — 🦐 Shrimp public key",
    hint: "g^a mod p — sent to 🦀 Crab",
  },
  {
    key: "B",
    label: "B — 🦀 Crab public key",
    hint: "g^b mod p — sent to 🦐 Shrimp",
  },
  { key: "s", label: "s — shared secret", hint: "B^a mod p = A^b mod p" },
];

function Field({
  meta,
  value,
  derived,
  onChange,
  onSubmit,
}: {
  meta: (typeof FIELD_META)[number];
  value: string;
  derived: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const id = `dh-${meta.key}`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label className={lab.fieldLabel} htmlFor={id}>
          {meta.label}
        </label>
        {derived && <span className="text-xs text-accent-fg">derived</span>}
      </div>
      <p className={`text-xs ${lab.hint} mb-1`}>{meta.hint}</p>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="integer"
        spellCheck={false}
        autoComplete="off"
        className={`${lab.answerLineInput} ${lab.fieldBorder} ${
          derived ? "text-accent-fg" : ""
        }`}
      />
    </div>
  );
}

const EMPTY: Params = { p: "", g: "", a: "", b: "", A: "", B: "", s: "" };

export function DHCalculator() {
  const [params, setParams] = useState<Params>(EMPTY);
  const [result, setResult] = useState<{
    values: Derived;
    errors: string[];
  } | null>(null);
  const [derivedKeys, setDerivedKeys] = useState<Set<keyof Params>>(new Set());

  function update(key: keyof Params, value: string) {
    setParams((p) => ({ ...p, [key]: value }));
    setDerivedKeys((prev) => {
      const s = new Set(prev);
      s.delete(key);
      return s;
    });
  }

  function calculate() {
    const { values, errors } = derive(params);

    const newDerived = new Set<keyof Params>();
    for (const k of Object.keys(values) as (keyof Params)[]) {
      if (!parseBigInt(params[k])) newDerived.add(k);
    }

    const next = { ...params };
    for (const k of newDerived) {
      next[k] = values[k]!.toString();
    }

    setParams(next);
    setDerivedKeys(newDerived);
    setResult({ values, errors });
  }

  function loadExample(ex: (typeof EXAMPLES)[number]) {
    setParams({ ...EMPTY, ...ex.params });
    setDerivedKeys(new Set());
    setResult(null);
  }

  function reset() {
    setParams(EMPTY);
    setDerivedKeys(new Set());
    setResult(null);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className={`${lab.panel} flex flex-wrap items-center gap-3`}>
        <button type="button" onClick={calculate} className={lab.btnPrimary}>
          Calculate
        </button>
        <span className={`text-sm ${lab.hint}`}>Examples:</span>
        {EXAMPLES.map((ex) => (
          <button
            type="button"
            key={ex.label}
            onClick={() => loadExample(ex)}
            className={lab.btnGhost}
          >
            {ex.label}
          </button>
        ))}
        <button
          type="button"
          onClick={reset}
          className={`${lab.btnGhost} ml-auto text-fg-muted`}
        >
          Clear
        </button>
      </div>

      {/* Errors */}
      {result && result.errors.length > 0 && (
        <div className={`${lab.errorBanner} space-y-1`}>
          {result.errors.map((e, i) => (
            <p key={i} className={lab.errorBannerText}>
              {e}
            </p>
          ))}
        </div>
      )}

      {/* Parameter grid */}
      <div className={lab.panel}>
        <h2 className={`${lab.heading3} mb-4`}>Shared parameters</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELD_META.slice(0, 2).map((m) => (
            <Field
              key={m.key}
              meta={m}
              value={params[m.key]}
              derived={derivedKeys.has(m.key)}
              onChange={(v) => update(m.key, v)}
              onSubmit={calculate}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Shrimp */}
        <div className={lab.panel}>
          <h2 className={`${lab.heading3} mb-4`}>🦐 Shrimp</h2>
          <div className="space-y-4">
            {FIELD_META.slice(2, 4)
              .filter((m) => m.key === "a")
              .map((m) => (
                <Field
                  key={m.key}
                  meta={m}
                  value={params[m.key]}
                  derived={derivedKeys.has(m.key)}
                  onChange={(v) => update(m.key, v)}
                  onSubmit={calculate}
                />
              ))}
            {FIELD_META.slice(4, 6)
              .filter((m) => m.key === "A")
              .map((m) => (
                <Field
                  key={m.key}
                  meta={m}
                  value={params[m.key]}
                  derived={derivedKeys.has(m.key)}
                  onChange={(v) => update(m.key, v)}
                  onSubmit={calculate}
                />
              ))}
          </div>
        </div>

        {/* Crab */}
        <div className={lab.panel}>
          <h2 className={`${lab.heading3} mb-4`}>🦀 Crab</h2>
          <div className="space-y-4">
            {FIELD_META.slice(2, 4)
              .filter((m) => m.key === "b")
              .map((m) => (
                <Field
                  key={m.key}
                  meta={m}
                  value={params[m.key]}
                  derived={derivedKeys.has(m.key)}
                  onChange={(v) => update(m.key, v)}
                  onSubmit={calculate}
                />
              ))}
            {FIELD_META.slice(4, 6)
              .filter((m) => m.key === "B")
              .map((m) => (
                <Field
                  key={m.key}
                  meta={m}
                  value={params[m.key]}
                  derived={derivedKeys.has(m.key)}
                  onChange={(v) => update(m.key, v)}
                  onSubmit={calculate}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Shared secret */}
      <div className={lab.panel}>
        <h2 className={`${lab.heading3} mb-4`}>Shared secret 🦐 🎉 🦀</h2>
        <Field
          meta={FIELD_META[6]!}
          value={params.s}
          derived={derivedKeys.has("s")}
          onChange={(v) => update("s", v)}
          onSubmit={calculate}
        />
        {result &&
          result.values.s !== undefined &&
          result.errors.length === 0 && (
            <p className={`mt-3 text-sm text-accent-fg`}>
              ✓ Shared secret verified — both sides compute the same value.
            </p>
          )}
      </div>
    </div>
  );
}
