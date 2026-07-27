"use client";

import { useState, useCallback, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { parseJSON, countLines, countKeys, type ParseResult } from "./json";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { lab } from "@/ui/lab";

type ParseIssue = Extract<ParseResult, { ok: false }>;

function highlightedParts(input: string, issue: ParseIssue) {
  if (issue.position === null) return null;

  const start = Math.max(0, Math.min(issue.position, input.length));
  const end = Math.max(start + 1, Math.min(start + issue.length, input.length));

  return {
    before: input.slice(0, start),
    target: input.slice(start, end) || " ",
    after: input.slice(end),
  };
}

function JsonInput({
  input,
  issue,
  onChange,
}: {
  input: string;
  issue: ParseIssue | null;
  onChange: (value: string) => void;
}) {
  const overlayRef = useRef<HTMLPreElement>(null);
  const parts = issue ? highlightedParts(input, issue) : null;
  const hasHighlight = Boolean(parts && input);

  return (
    <div className="relative">
      {parts && input ? (
        <pre
          ref={overlayRef}
          aria-hidden="true"
          className={`${lab.textareaBase} pointer-events-none absolute inset-x-0 bottom-0 top-0 z-0 resize-none overflow-hidden whitespace-pre-wrap break-words border border-transparent bg-surface text-fg`}
          data-testid="json-input-highlight"
        >
          <span>{parts.before}</span>
          <span
            className="rounded-sm bg-danger-surface/35 underline decoration-danger-fg decoration-wavy decoration-2 underline-offset-4"
            data-testid="json-error-underline"
          >
            {parts.target}
          </span>
          <span>{parts.after}</span>
        </pre>
      ) : null}
      <textarea
        id="json-input"
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (!overlayRef.current) return;
          overlayRef.current.scrollTop = e.currentTarget.scrollTop;
          overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }}
        aria-invalid={issue ? true : undefined}
        aria-describedby={issue ? "json-error-message" : undefined}
        placeholder={'{\n  "key": "value"\n}'}
        rows={20}
        className={`${lab.textareaBase} relative z-10 resize-y ${lab.fieldBorder} ${
          issue
            ? "border-danger focus:border-danger focus:ring-rose-900/40"
            : ""
        } ${
          hasHighlight
            ? "bg-transparent text-transparent caret-fg selection:bg-emerald-700/45"
            : ""
        }`}
        spellCheck={false}
      />
    </div>
  );
}

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const { copied, copy } = useCopyToClipboard();
  const [indentSize, setIndentSize] = useState(2);

  const run = useCallback(
    (transform: (v: unknown) => string) => {
      const parsed = parseJSON(input);
      setResult(parsed);
      setOutput(parsed.ok ? transform(parsed.value) : "");
    },
    [input],
  );

  const prettify = useCallback(
    () => run((v) => JSON.stringify(v, null, indentSize)),
    [run, indentSize],
  );

  const minify = useCallback(() => run((v) => JSON.stringify(v)), [run]);

  const validate = useCallback(() => {
    const parsed = parseJSON(input);
    setResult(parsed);
    if (!parsed.ok) setOutput("");
  }, [input]);

  const clear = useCallback(() => {
    setInput("");
    setOutput("");
    setResult(null);
  }, []);

  const copyOutput = useCallback(() => {
    if (output) copy(output);
  }, [output, copy]);

  const parsedValue = result?.ok ? result.value : null;
  const issue = result && !result.ok ? result : null;
  const isArray = Array.isArray(parsedValue);
  const isObject =
    parsedValue !== null && typeof parsedValue === "object" && !isArray;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className={`${lab.panel} flex flex-wrap items-center gap-3`}>
        <button type="button" onClick={prettify} className={lab.btnPrimary}>
          Prettify
        </button>
        <button type="button" onClick={minify} className={lab.btnGhost}>
          Minify
        </button>
        <button type="button" onClick={validate} className={lab.btnGhost}>
          Validate
        </button>

        <div className="flex items-center gap-2 ml-2">
          <span className={`${lab.hint} text-sm`}>Indent</span>
          {[2, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIndentSize(n)}
              aria-pressed={indentSize === n}
              className={`${lab.btnGhostSm} ${indentSize === n ? lab.btnGhostActive : ""}`}
            >
              {n}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={clear}
          className={`${lab.btnGhost} ml-auto text-fg-muted`}
        >
          Clear
        </button>
      </div>

      {/* Status */}
      {result && (
        <div className="flex items-center gap-3">
          {result.ok ? (
            <span className={lab.badgeOk}>Valid JSON</span>
          ) : (
            <span className={lab.badgeBad}>Invalid JSON</span>
          )}
          {result.ok && parsedValue !== null && (
            <span className={lab.hint}>
              {isArray && `Array · ${countKeys(parsedValue)} items`}
              {isObject && `Object · ${countKeys(parsedValue)} keys`}
              {!isArray && !isObject && typeof parsedValue}
            </span>
          )}
          {!result.ok && result.line !== null && (
            <span className={lab.hint}>
              line {result.line}, col {result.col}
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {result && !result.ok && (
        <div className={lab.errorBanner}>
          <p id="json-error-message" className={lab.errorBannerText}>
            {result.message}
          </p>
        </div>
      )}

      {/* Editor panes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className={lab.fieldLabel} htmlFor="json-input">
            Input
          </label>
          <JsonInput
            input={input}
            issue={issue}
            onChange={(value) => {
              setInput(value);
              setResult(null);
              setOutput("");
            }}
          />
          <p className={lab.hint}>{countLines(input)} lines</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={lab.fieldLabel} htmlFor="json-output">
              Output
            </label>
            {output && (
              <button
                type="button"
                onClick={copyOutput}
                className={lab.iconButtonSm}
                aria-label={copied ? "Copied output" : "Copy output"}
                title={copied ? "Copied output" : "Copy output"}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            )}
          </div>
          <textarea
            id="json-output"
            value={output}
            readOnly
            rows={20}
            placeholder="Output appears here"
            className={`${lab.textareaBase} resize-y ${lab.fieldBorder} text-fg-soft`}
            spellCheck={false}
          />
          {output && (
            <p className={lab.hint}>
              {countLines(output)} lines · {output.length.toLocaleString()}{" "}
              chars
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
