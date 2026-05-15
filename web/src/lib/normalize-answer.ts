/**
 * Normalize CLI output for comparison:
 * - LF line endings
 * - Per line: trim leading/trailing whitespace, collapse internal runs of
 *   whitespace (spaces, tabs, etc.) to a single ASCII space — so tool padding
 *   differences (e.g. BSD vs GNU `wc` / `uniq -c`) still match
 * - Drop leading/trailing blank lines from the whole output
 *
 * Does not treat NUL (`\0`) as whitespace; it is preserved.
 */
export function normalizeAnswer(raw: string): string {
  const lf = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = lf.split("\n").map((line) => line.trim().replace(/\s+/g, " "));
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  while (lines.length > 0 && lines[0] === "") {
    lines.shift();
  }
  return lines.join("\n");
}

export function answersMatch(user: string, expected: string): boolean {
  return normalizeAnswer(user) === normalizeAnswer(expected);
}

/** Returns true when the user's answer matches any string in `accepted`. */
export function anyAnswerMatches(
  user: string,
  accepted: readonly string[],
): boolean {
  const normalized = normalizeAnswer(user);
  return accepted.some((a) => normalized === normalizeAnswer(a));
}
