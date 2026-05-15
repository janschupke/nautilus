import { describe, expect, it } from "vitest";
import { answersMatch, anyAnswerMatches, normalizeAnswer } from "./normalize-answer";

describe("normalizeAnswer", () => {
  it("converts CRLF and CR to LF", () => {
    expect(normalizeAnswer("a\r\nb\rc")).toBe("a\nb\nc");
  });

  it("trims each line and collapses internal whitespace runs to a single space", () => {
    expect(normalizeAnswer("east     10  \t")).toBe("east 10");
    expect(normalizeAnswer("   3 dev")).toBe("3 dev");
    expect(normalizeAnswer("a\t\tb")).toBe("a b");
  });

  it("drops leading and trailing blank lines", () => {
    expect(normalizeAnswer("\n\na\nb\n\n")).toBe("a\nb");
  });

  it("preserves internal blank lines", () => {
    expect(normalizeAnswer("a\n\nb")).toBe("a\n\nb");
  });

  it("does not treat NUL as whitespace", () => {
    expect(normalizeAnswer("before\0after")).toBe("before\0after");
    expect(answersMatch("before\0after", "before\0after")).toBe(true);
    expect(answersMatch("before\0after", "before after")).toBe(false);
  });

  it("returns empty string for only newlines", () => {
    expect(normalizeAnswer("\n\n")).toBe("");
  });
});

describe("anyAnswerMatches", () => {
  it("returns true when user answer matches any entry", () => {
    expect(anyAnswerMatches("yes", ["yes", "y"])).toBe(true);
    expect(anyAnswerMatches("y", ["yes", "y"])).toBe(true);
  });

  it("returns false when no entry matches", () => {
    expect(anyAnswerMatches("no", ["yes", "y"])).toBe(false);
  });

  it("normalizes before comparing", () => {
    expect(anyAnswerMatches(" yes\n", ["yes", "y"])).toBe(true);
  });

  it("returns false for empty accepted list", () => {
    expect(anyAnswerMatches("yes", [])).toBe(false);
  });
});

describe("answersMatch", () => {
  it("returns true when normalized forms match", () => {
    expect(answersMatch("a\r\nb", "a\nb")).toBe(true);
    expect(answersMatch(" 42\n", "42")).toBe(true);
    expect(answersMatch("41", "42")).toBe(false);
  });

  it("treats different padding as equal when tokens match", () => {
    expect(answersMatch("     79 total", "      79 total")).toBe(true);
    expect(answersMatch("   3 dev", "     3 dev")).toBe(true);
  });

  it("matches multiline output with uneven spacing per line", () => {
    expect(
      answersMatch(
        "web    8080   up\napi  9000  down",
        "web 8080 up\napi 9000 down",
      ),
    ).toBe(true);
  });

  it("ignores trailing blank lines on user input", () => {
    expect(answersMatch("east\nwest\n", "east\nwest")).toBe(true);
  });
});
