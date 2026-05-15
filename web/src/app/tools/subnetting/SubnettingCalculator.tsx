"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  type Version,
  type InfoResult,
  type SubnetEntry,
  type Allocation,
  calcInfo,
  vlsmAllocate,
} from "./subnet";
import { lab } from "@/ui/lab";

// ── Shared UI primitives ──────────────────────────────────────────────────────

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stroke py-3 last:border-0">
      <span className="text-base text-fg-muted">{label}</span>
      <span className="font-mono text-base text-fg">{value}</span>
    </div>
  );
}

function TabBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`${lab.btnGhostSm} px-3 py-1.5 text-sm ${
            value === o.value ? lab.btnGhostActive : ""
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Info panel ────────────────────────────────────────────────────────────────

function InfoPanel({ version }: { version: Version }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<InfoResult | string | null>(null);

  const calc = useCallback(() => {
    setResult(calcInfo(input.trim(), version));
  }, [input, version]);

  const info = typeof result === "object" && result !== null ? result : null;
  const error = typeof result === "string" ? result : null;
  const placeholder = version === "v4" ? "192.168.1.0/24" : "2001:db8::/32";

  return (
    <div className="space-y-4">
      <div className={lab.panel}>
        <label className={lab.fieldLabel} htmlFor="info-input">
          {version === "v4" ? "IPv4" : "IPv6"} address / prefix
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id="info-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && calc()}
            placeholder={placeholder}
            className={`${lab.answerLineInput} flex-1 ${lab.fieldBorder}`}
            spellCheck={false}
            autoComplete="off"
          />
          <button onClick={calc} className={lab.btnPrimary}>
            Calculate
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-danger-fg">{error}</p>}
      </div>

      {info && (
        <div className={lab.panel}>
          <ResultRow label="Network address" value={info.cidr} />
          {info.mask && <ResultRow label="Subnet mask" value={info.mask} />}
          {info.wildcard && (
            <ResultRow label="Wildcard mask" value={info.wildcard} />
          )}
          {info.broadcast && (
            <ResultRow label="Broadcast address" value={info.broadcast} />
          )}
          <ResultRow label="First usable address" value={info.first} />
          <ResultRow label="Last usable address" value={info.last} />
          <ResultRow label="Total addresses" value={info.total} />
          <ResultRow label="Usable addresses" value={info.usable} />
          {info.ipClass && <ResultRow label="IP class" value={info.ipClass} />}
        </div>
      )}
    </div>
  );
}

// ── VLSM planner ─────────────────────────────────────────────────────────────

let nextId = 0;
function makeId() {
  return String(++nextId);
}
function makeEntry(name = "", hosts = ""): SubnetEntry {
  return { id: makeId(), name, hosts };
}

function VlsmPlanner({ version }: { version: Version }) {
  const [base, setBase] = useState("");
  const [entries, setEntries] = useState<SubnetEntry[]>(() => [
    makeEntry("Management", ""),
    makeEntry("Servers", ""),
    makeEntry("Workstations", ""),
  ]);
  const [result, setResult] = useState<Allocation[] | string | null>(null);

  const addEntry = () => setEntries((e) => [...e, makeEntry()]);
  const removeEntry = (id: string) =>
    setEntries((e) => e.filter((x) => x.id !== id));
  const updateEntry = (id: string, field: "name" | "hosts", val: string) =>
    setEntries((e) => e.map((x) => (x.id === id ? { ...x, [field]: val } : x)));

  function plan() {
    setResult(vlsmAllocate(base.trim(), entries, version));
  }

  const allocs = Array.isArray(result) ? result : null;
  const error = typeof result === "string" ? result : null;
  const placeholder = version === "v4" ? "10.0.0.0/22" : "2001:db8::/48";

  return (
    <div className="space-y-4">
      {/* Base network */}
      <div className={lab.panel}>
        <label className={lab.fieldLabel} htmlFor="vlsm-base">
          Base network
        </label>
        <div className="mt-2 flex gap-3">
          <input
            id="vlsm-base"
            type="text"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && plan()}
            placeholder={placeholder}
            className={`${lab.answerLineInput} flex-1 ${lab.fieldBorder}`}
            spellCheck={false}
            autoComplete="off"
          />
          <button onClick={plan} className={lab.btnPrimary}>
            Plan
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-danger-fg">{error}</p>}
      </div>

      {/* Subnet list */}
      <div className={lab.panel}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={lab.heading3}>Subnets</h3>
          <button
            onClick={addEntry}
            aria-label="Add subnet"
            className="rounded border border-stroke-muted p-2.5 text-fg-faint hover:bg-surface-raised hover:text-fg"
          >
            <Plus size={15} />
          </button>
        </div>
        <div className="space-y-2">
          {entries.map((e) => (
            <div
              key={e.id}
              className="grid grid-cols-[1fr_9rem_auto] items-center gap-2"
            >
              <input
                type="text"
                value={e.name}
                onChange={(ev) => updateEntry(e.id, "name", ev.target.value)}
                onKeyDown={(ev) => ev.key === "Enter" && plan()}
                placeholder="Subnet name"
                className={`${lab.answerLineInput} ${lab.fieldBorder} text-sm`}
                spellCheck={false}
              />
              <input
                type="number"
                min={1}
                value={e.hosts}
                onChange={(ev) => updateEntry(e.id, "hosts", ev.target.value)}
                onKeyDown={(ev) => ev.key === "Enter" && plan()}
                placeholder="Hosts needed"
                className={`${lab.answerLineInput} ${lab.fieldBorder} text-sm`}
              />
              <button
                onClick={() => removeEntry(e.id)}
                disabled={entries.length === 1}
                className="rounded border border-stroke-muted p-2.5 text-fg-faint hover:border-danger/60 hover:text-danger-fg disabled:opacity-30"
                aria-label="Remove subnet"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <p className={`mt-3 text-xs ${lab.hint}`}>
          Subnets are allocated largest-first (VLSM) within the base network.
        </p>
      </div>

      {/* Results */}
      {allocs && allocs.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stroke">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stroke bg-surface-raised/50">
                {[
                  "Name",
                  "Need",
                  "Prefix",
                  "Allocated CIDR",
                  "First host",
                  "Last host",
                  "Usable",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left font-semibold text-fg-faint uppercase tracking-wide text-xs"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allocs.map((a) => (
                <tr
                  key={a.id}
                  className={`border-b border-stroke last:border-0 ${
                    a.error
                      ? "bg-danger-surface/10"
                      : "hover:bg-surface-raised/30"
                  }`}
                >
                  <td className="px-3 py-2.5 font-medium text-fg">{a.name}</td>
                  <td className="px-3 py-2.5 text-fg-muted tabular-nums">
                    {a.required}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-fg-soft">
                    /{a.prefix}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-accent-fg">
                    {a.cidr}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-fg-soft">
                    {a.first}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-fg-soft">
                    {a.last}
                  </td>
                  <td className="px-3 py-2.5 text-fg-muted tabular-nums">
                    {a.error ? (
                      <span className="text-danger-fg">{a.error}</span>
                    ) : (
                      a.usable.toLocaleString()
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

type Mode = "info" | "vlsm";

export function SubnettingCalculator() {
  const [version, setVersion] = useState<Version>("v4");
  const [mode, setMode] = useState<Mode>("info");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabBar
          options={[
            { value: "v4" as Version, label: "IPv4" },
            { value: "v6" as Version, label: "IPv6" },
          ]}
          value={version}
          onChange={setVersion}
        />
        <TabBar
          options={[
            { value: "info" as Mode, label: "Info" },
            { value: "vlsm" as Mode, label: "Subnet planner" },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>

      {mode === "info" ? (
        <InfoPanel key={version} version={version} />
      ) : (
        <VlsmPlanner key={version} version={version} />
      )}
    </div>
  );
}
