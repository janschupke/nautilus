"use client";

import { useState, useCallback } from "react";
import {
  parseJSON,
  countLines,
  countKeys,
  type ParseResult,
} from "./json";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { lab } from "@/ui/lab";

export function JsonFormatter() {
  const [input, setInput]       = useState("");
  const [output, setOutput]     = useState("");
  const [result, setResult]     = useState<ParseResult | null>(null);
  const { copied, copy }        = useCopyToClipboard();
  const [indentSize, setIndentSize] = useState(2);

  const run = useCallback(
    (transform: (v: unknown) => string) => {
      if (!input.trim()) return;
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

  const minify = useCallback(
    () => run((v) => JSON.stringify(v)),
    [run],
  );

  const clear = useCallback(() => {
    setInput(""); setOutput(""); setResult(null);
  }, []);

  const copyOutput = useCallback(() => {
    if (output) copy(output);
  }, [output, copy]);

  const parsedValue = result?.ok ? result.value : null;
  const isArray  = Array.isArray(parsedValue);
  const isObject = parsedValue !== null && typeof parsedValue === "object" && !isArray;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className={`${lab.panel} flex flex-wrap items-center gap-3`}>
        <button onClick={prettify} className={lab.btnPrimary}>Prettify</button>
        <button onClick={minify}   className={lab.btnGhost}>Minify</button>

        <div className="flex items-center gap-2 ml-2">
          <span className={`${lab.hint} text-sm`}>Indent</span>
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndentSize(n)}
              className={`${lab.btnGhostSm} px-3 py-1.5 text-sm ${indentSize === n ? lab.btnGhostActive : ""}`}
            >
              {n}
            </button>
          ))}
        </div>

        <button onClick={clear} className={`${lab.btnGhost} ml-auto text-fg-muted`}>
          Clear
        </button>
      </div>

      {/* Status */}
      {result && (
        <div className="flex items-center gap-3">
          {result.ok
            ? <span className={lab.badgeOk}>Valid JSON</span>
            : <span className={lab.badgeBad}>Invalid JSON</span>}
          {result.ok && parsedValue !== null && (
            <span className={lab.hint}>
              {isArray  && `Array · ${countKeys(parsedValue)} items`}
              {isObject && `Object · ${countKeys(parsedValue)} keys`}
              {!isArray && !isObject && typeof parsedValue}
            </span>
          )}
          {!result.ok && result.line !== null && (
            <span className={lab.hint}>line {result.line}, col {result.col}</span>
          )}
        </div>
      )}

      {/* Error */}
      {result && !result.ok && (
        <div className={lab.errorBanner}>
          <p className={lab.errorBannerText}>{result.message}</p>
        </div>
      )}

      {/* Editor panes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className={lab.fieldLabel} htmlFor="json-input">Input</label>
          <textarea
            id="json-input"
            value={input}
            onChange={(e) => { setInput(e.target.value); setResult(null); setOutput(""); }}
            placeholder={'{\n  "key": "value"\n}'}
            rows={20}
            className={`${lab.textareaBase} resize-y ${lab.fieldBorder}`}
            spellCheck={false}
          />
          <p className={lab.hint}>{countLines(input)} lines</p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={lab.fieldLabel} htmlFor="json-output">Output</label>
            {output && (
              <button onClick={copyOutput} className={`${lab.btnGhostSm} px-3 py-1 text-sm`}>
                {copied ? "Copied" : "Copy"}
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
              {countLines(output)} lines · {output.length.toLocaleString()} chars
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
