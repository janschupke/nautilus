export type ParseResult =
  | { ok: true; value: unknown }
  | { ok: false; message: string; line: number | null; col: number | null };

export function parseJSON(raw: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : String(e);
    const m = msg.match(/at line (\d+) column (\d+)/);
    return {
      ok: false,
      message: msg,
      line: m ? parseInt(m[1], 10) : null,
      col: m ? parseInt(m[2], 10) : null,
    };
  }
}

/** Find position of `//` on a line that is not inside a string. */
function lineCommentStart(line: string): number {
  let inStr = false;
  let strChar = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inStr) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === strChar) inStr = false;
    } else {
      if (c === '"' || c === "'") {
        inStr = true;
        strChar = c;
      } else if (c === "/" && line[i + 1] === "/") return i;
    }
  }
  return -1;
}

/** Replace single-quoted strings with double-quoted equivalents. */
function fixSingleQuotes(s: string): string {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '"') {
      out += c;
      i++;
      while (i < s.length) {
        const d = s[i];
        if (d === "\\") {
          out += d + (s[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += d;
        i++;
        if (d === '"') break;
      }
    } else if (c === "'") {
      out += '"';
      i++;
      while (i < s.length) {
        const d = s[i];
        if (d === "\\") {
          const next = s[i + 1] ?? "";
          if (next === "'") {
            out += "'";
            i += 2;
            continue;
          }
          out += d + next;
          i += 2;
          continue;
        }
        if (d === '"') {
          out += '\\"';
          i++;
          continue;
        }
        if (d === "'") {
          out += '"';
          i++;
          break;
        }
        out += d;
        i++;
      }
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/** Add closing braces/brackets that are missing, using a stack. */
function closeBraces(s: string): string {
  const stack: string[] = [];
  let inStr = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === '"') inStr = false;
    } else {
      if (c === '"') inStr = true;
      else if (c === "{") stack.push("}");
      else if (c === "[") stack.push("]");
      else if ((c === "}" || c === "]") && stack.at(-1) === c) stack.pop();
    }
  }
  return stack.length ? s.trimEnd() + "\n" + stack.reverse().join("") : s;
}

export function repairJSON(raw: string): string {
  let s = raw.trim();

  // 1. Strip block comments  /* … */
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");

  // 2. Strip line comments  // …  (outside strings)
  s = s
    .split("\n")
    .map((line) => {
      const pos = lineCommentStart(line);
      return pos >= 0 ? line.slice(0, pos) : line;
    })
    .join("\n");

  // 3. Python / JS literals
  s = s
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/\bNone\b/g, "null")
    .replace(/\bundefined\b/g, "null");

  // 4. Single quotes → double quotes
  s = fixSingleQuotes(s);

  // 5. Trailing commas before } or ]
  s = s.replace(/,(\s*[}\]])/g, "$1");

  // 6. Unquoted object keys  { key: … } → { "key": … }
  s = s.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g, '$1"$2"$3');

  // 7. Add missing closing braces / brackets
  s = closeBraces(s);

  return s;
}

export function countLines(text: string): number {
  return text ? text.split("\n").length : 0;
}

export function countKeys(value: unknown): number {
  if (value === null || typeof value !== "object") return 0;
  if (Array.isArray(value)) return value.length;
  return Object.keys(value as object).length;
}
