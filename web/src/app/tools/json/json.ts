export type ParseResult =
  | { ok: true; value: unknown }
  | {
      ok: false;
      message: string;
      line: number | null;
      col: number | null;
      position: number | null;
      length: number;
    };

function locationFromPosition(
  raw: string,
  position: number,
): { line: number; col: number } {
  let line = 1;
  let col = 1;

  for (let i = 0; i < Math.min(position, raw.length); i++) {
    if (raw[i] === "\n") {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }

  return { line, col };
}

function positionFromLocation(
  raw: string,
  line: number | null,
  col: number | null,
): number | null {
  if (line === null || col === null || line < 1 || col < 1) return null;

  let currentLine = 1;
  let position = 0;

  while (position < raw.length && currentLine < line) {
    if (raw[position] === "\n") currentLine += 1;
    position += 1;
  }

  return Math.min(raw.length, position + col - 1);
}

function issueAt(
  raw: string,
  position: number,
  message: string,
  length = 1,
): Extract<ParseResult, { ok: false }> {
  const clampedPosition = Math.max(0, Math.min(position, raw.length));
  const { line, col } = locationFromPosition(raw, clampedPosition);
  return { ok: false, message, line, col, position: clampedPosition, length };
}

function syntaxLocation(
  raw: string,
  message: string,
): Pick<Extract<ParseResult, { ok: false }>, "line" | "col" | "position"> {
  const positionMatch = message.match(/position\s+(\d+)/i);
  const lineColumnMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

  const parsedPosition = positionMatch ? parseInt(positionMatch[1]!, 10) : null;
  const parsedLine = lineColumnMatch ? parseInt(lineColumnMatch[1]!, 10) : null;
  const parsedCol = lineColumnMatch ? parseInt(lineColumnMatch[2]!, 10) : null;

  if (parsedPosition !== null && Number.isFinite(parsedPosition)) {
    const { line, col } = locationFromPosition(raw, parsedPosition);
    return { line, col, position: parsedPosition };
  }

  const position = positionFromLocation(raw, parsedLine, parsedCol);
  return { line: parsedLine, col: parsedCol, position };
}

function findTrailingComma(raw: string): number | null {
  let inStr = false;

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];

    if (inStr) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === '"') inStr = false;
      continue;
    }

    if (c === '"') {
      inStr = true;
      continue;
    }

    if (c !== ",") continue;

    let next = i + 1;
    while (/\s/.test(raw[next] ?? "")) next += 1;
    if (raw[next] === "}" || raw[next] === "]") return i;
  }

  return null;
}

function findComment(raw: string): number | null {
  let inStr = false;

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];

    if (inStr) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === '"') inStr = false;
      continue;
    }

    if (c === '"') {
      inStr = true;
      continue;
    }

    if (c === "/" && (raw[i + 1] === "/" || raw[i + 1] === "*")) return i;
  }

  return null;
}

function findSingleQuote(raw: string): number | null {
  let inStr = false;

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];

    if (inStr) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === '"') inStr = false;
      continue;
    }

    if (c === '"') {
      inStr = true;
      continue;
    }

    if (c === "'") return i;
  }

  return null;
}

function findBareObjectKey(raw: string): number | null {
  let inStr = false;

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];

    if (inStr) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === '"') inStr = false;
      continue;
    }

    if (c === '"') {
      inStr = true;
      continue;
    }

    if (c !== "{" && c !== ",") continue;

    let keyStart = i + 1;
    while (/\s/.test(raw[keyStart] ?? "")) keyStart += 1;
    if (!/[A-Za-z_$]/.test(raw[keyStart] ?? "")) continue;

    let keyEnd = keyStart + 1;
    while (/[A-Za-z0-9_$]/.test(raw[keyEnd] ?? "")) keyEnd += 1;

    let colon = keyEnd;
    while (/\s/.test(raw[colon] ?? "")) colon += 1;
    if (raw[colon] === ":") return keyStart;
  }

  return null;
}

function classifySyntaxError(
  raw: string,
  message: string,
): Extract<ParseResult, { ok: false }> {
  if (!raw.trim()) {
    return {
      ok: false,
      message:
        "JSON input is empty. Paste a JSON value before running this tool.",
      line: null,
      col: null,
      position: null,
      length: 0,
    };
  }

  const trailingComma = findTrailingComma(raw);
  if (trailingComma !== null) {
    return issueAt(
      raw,
      trailingComma,
      "Trailing commas are invalid in JSON. Remove the comma before the closing brace or bracket.",
    );
  }

  const comment = findComment(raw);
  if (comment !== null) {
    return issueAt(raw, comment, "Comments are not valid in JSON.");
  }

  const singleQuote = findSingleQuote(raw);
  if (singleQuote !== null) {
    return issueAt(
      raw,
      singleQuote,
      "JSON strings and object keys must use double quotes.",
    );
  }

  const bareKey = findBareObjectKey(raw);
  if (bareKey !== null) {
    return issueAt(
      raw,
      bareKey,
      "Object property names must be double-quoted in JSON.",
    );
  }

  const { line, col, position } = syntaxLocation(raw, message);
  return { ok: false, message, line, col, position, length: 1 };
}

export function parseJSON(raw: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : String(e);
    return classifySyntaxError(raw, msg);
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
