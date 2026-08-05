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
import { LiveStatus } from "@/components/LiveStatus";
import { ScrollRegion } from "@/components/ScrollRegion";
import { lab } from "@/ui/lab";

// ── Shared UI primitives ──────────────────────────────────────────────────────

/** Term/description pair so each value is programmatically tied to its label. */
function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-stroke py-3 last:border-0">
      <dt className="text-base text-fg-muted">{label}</dt>
      <dd className="font-mono text-base text-fg">{value}</dd>
    </div>
  );
}

function TabBar<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  /** Names the button group — "IPv4, pressed" is meaningless on its own. */
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`${lab.btnGhostSm} ${
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
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "info-error" : undefined}
            className={`${lab.controlInput} flex-1 ${lab.fieldBorder}`}
            spellCheck={false}
            autoComplete="off"
          />
          <button type="button" onClick={calc} className={lab.btnPrimary}>
            Calculate
          </button>
        </div>
        <div role="alert" className="empty:hidden">
          {error && (
            <p id="info-error" className="mt-3 text-sm text-danger-fg">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* Value-free announcement: the figures themselves are on screen, and
          echoing them here would duplicate every address in the DOM. */}
      <LiveStatus message={info ? "Address information updated." : ""} />

      {info && (
        <dl className={lab.panel}>
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
        </dl>
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
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "vlsm-error" : undefined}
            className={`${lab.controlInput} flex-1 ${lab.fieldBorder}`}
            spellCheck={false}
            autoComplete="off"
          />
          <button type="button" onClick={plan} className={lab.btnPrimary}>
            Plan
          </button>
        </div>
        <div role="alert" className="empty:hidden">
          {error && (
            <p id="vlsm-error" className="mt-3 text-sm text-danger-fg">
              {error}
            </p>
          )}
        </div>
      </div>

      <LiveStatus
        message={allocs ? `${allocs.length} subnets allocated.` : ""}
      />

      {/* Subnet list */}
      <div className={lab.panel}>
        <div className="flex items-center justify-between mb-3">
          <h2 className={lab.heading3}>Subnets</h2>
          <button
            type="button"
            onClick={addEntry}
            aria-label="Add subnet"
            className={lab.iconButton}
          >
            <Plus size={15} />
          </button>
        </div>
        <ScrollRegion label="Subnet list">
          <div className="min-w-[28rem] space-y-2">
            {entries.map((e, i) => {
              // Placeholders are not accessible names, and every row would
              // otherwise present two unnamed fields and an identical button.
              const rowName = e.name.trim() || `subnet ${i + 1}`;
              return (
                <div
                  key={e.id}
                  className="grid grid-cols-[1fr_9rem_auto] items-center gap-2"
                >
                  <input
                    type="text"
                    value={e.name}
                    onChange={(ev) =>
                      updateEntry(e.id, "name", ev.target.value)
                    }
                    onKeyDown={(ev) => ev.key === "Enter" && plan()}
                    placeholder="Subnet name"
                    aria-label={`Name for subnet ${i + 1}`}
                    className={`${lab.controlInput} ${lab.fieldBorder}`}
                    spellCheck={false}
                  />
                  <input
                    type="number"
                    min={1}
                    value={e.hosts}
                    onChange={(ev) =>
                      updateEntry(e.id, "hosts", ev.target.value)
                    }
                    onKeyDown={(ev) => ev.key === "Enter" && plan()}
                    placeholder="Hosts needed"
                    aria-label={`Hosts needed for ${rowName}`}
                    className={`${lab.controlInput} ${lab.fieldBorder}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeEntry(e.id)}
                    disabled={entries.length === 1}
                    className={`${lab.iconButton} hover:border-danger-stroke hover:text-danger-fg`}
                    aria-label={`Remove ${rowName}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollRegion>
        <p className={`mt-3 text-xs ${lab.hint}`}>
          Subnets are allocated largest-first (VLSM) within the base network.
        </p>
      </div>

      {/* Results */}
      {allocs && allocs.length > 0 && (
        <ScrollRegion
          label="Subnet allocation results"
          className="rounded-xl border border-stroke"
        >
          <table className="w-full border-collapse text-sm">
            <caption className={lab.srOnly}>
              Subnets allocated within the base network, largest first
            </caption>
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
                    scope="col"
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
        </ScrollRegion>
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
          label="IP version"
          options={[
            { value: "v4" as Version, label: "IPv4" },
            { value: "v6" as Version, label: "IPv6" },
          ]}
          value={version}
          onChange={setVersion}
        />
        <TabBar
          label="Calculator mode"
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
