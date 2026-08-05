import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MANIFEST } from "@/content/manifest";
import { setHotkeysEnabled } from "@/lib/storage";
import { NavHotkeys } from "./NavHotkeys";

// ── Derived constants ───────────────────────────────────────────────────────

// FLAT_NAV mirrors the structure built inside NavHotkeys.tsx
type NavItem =
  | { kind: "module"; moduleId: string; href: string }
  | { kind: "topic"; moduleId: string; topicId: string; href: string };

const FLAT_NAV: NavItem[] = MANIFEST.modules.flatMap((mod) => [
  { kind: "module", moduleId: mod.id, href: `/${mod.id}` },
  ...mod.topics.map((t) => ({
    kind: "topic" as const,
    moduleId: mod.id,
    topicId: t.id,
    href: `/${mod.id}/${t.id}`,
  })),
]);

const FIRST = FLAT_NAV[0]!; // first module summary
const LAST = FLAT_NAV[FLAT_NAV.length - 1]!; // last topic

// First module: summary + first topic
const firstMod = MANIFEST.modules[0]!;
const firstModHref = `/${firstMod.id}`;
const firstTopicHref = `/${firstMod.id}/${firstMod.topics[0]!.id}`;
const secondTopicHref = `/${firstMod.id}/${firstMod.topics[1]!.id}`;
const lastTopicOfFirstMod = firstMod.topics.at(-1)!.id;

// Second module: summary
const secondMod = MANIFEST.modules[1]!;
const secondModHref = `/${secondMod.id}`;

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
const pathnameRef = { current: "/" };

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
  useRouter: () => ({ push: mockPush }),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function setup(pathname: string) {
  pathnameRef.current = pathname;
  render(<NavHotkeys />);
}

function fireKey(key: string) {
  document.body.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true }),
  );
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("NavHotkeys", () => {
  beforeEach(() => {
    mockPush.mockClear();
    pathnameRef.current = "/";
    localStorage.clear();
  });

  // ── Letter shortcuts ──────────────────────────────────────────────────────

  describe("letter shortcuts", () => {
    it.each([
      ["h", "/"],
      ["l", "/lab-setup"],
      ["s", "/stats"],
      ["t", "/tools"],
      ["r", "/rtfm"],
    ])("key %s navigates to %s", (key, path) => {
      setup("/");
      fireKey(key);
      expect(mockPush).toHaveBeenCalledWith(path);
    });
  });

  // ── j — forward navigation ────────────────────────────────────────────────

  describe("j", () => {
    it("goes to first item (first module summary) when not on a nav page", () => {
      setup("/");
      fireKey("j");
      expect(mockPush).toHaveBeenCalledWith(FIRST.href);
    });

    it("advances from module summary to first topic", () => {
      setup(firstModHref);
      fireKey("j");
      expect(mockPush).toHaveBeenCalledWith(firstTopicHref);
    });

    it("advances to next topic in same module", () => {
      setup(firstTopicHref);
      fireKey("j");
      expect(mockPush).toHaveBeenCalledWith(secondTopicHref);
    });

    it("crosses module boundary: last topic of first module → second module summary", () => {
      setup(`/${firstMod.id}/${lastTopicOfFirstMod}`);
      fireKey("j");
      expect(mockPush).toHaveBeenCalledWith(secondModHref);
    });

    it("wraps from last item to first", () => {
      setup(LAST.href);
      fireKey("j");
      expect(mockPush).toHaveBeenCalledWith(FIRST.href);
    });
  });

  // ── k — backward navigation ───────────────────────────────────────────────

  describe("k", () => {
    it("goes to last item when not on a nav page", () => {
      setup("/");
      fireKey("k");
      expect(mockPush).toHaveBeenCalledWith(LAST.href);
    });

    it("retreats from first topic to module summary", () => {
      setup(firstTopicHref);
      fireKey("k");
      expect(mockPush).toHaveBeenCalledWith(firstModHref);
    });

    it("retreats to previous topic in same module", () => {
      setup(secondTopicHref);
      fireKey("k");
      expect(mockPush).toHaveBeenCalledWith(firstTopicHref);
    });

    it("crosses module boundary: second module summary → last topic of first module", () => {
      setup(secondModHref);
      fireKey("k");
      expect(mockPush).toHaveBeenCalledWith(
        `/${firstMod.id}/${lastTopicOfFirstMod}`,
      );
    });

    it("wraps from first item to last", () => {
      setup(FIRST.href);
      fireKey("k");
      expect(mockPush).toHaveBeenCalledWith(LAST.href);
    });
  });

  // ── + / - — same behaviour as j / k ──────────────────────────────────────

  describe("+", () => {
    it("goes to first item when not on a nav page", () => {
      setup("/");
      fireKey("+");
      expect(mockPush).toHaveBeenCalledWith(FIRST.href);
    });

    it("wraps from last to first", () => {
      setup(LAST.href);
      fireKey("+");
      expect(mockPush).toHaveBeenCalledWith(FIRST.href);
    });
  });

  describe("-", () => {
    it("goes to last item when not on a nav page", () => {
      setup("/");
      fireKey("-");
      expect(mockPush).toHaveBeenCalledWith(LAST.href);
    });

    it("wraps from first to last", () => {
      setup(FIRST.href);
      fireKey("-");
      expect(mockPush).toHaveBeenCalledWith(LAST.href);
    });
  });
  describe("when the user switches shortcuts off", () => {
    it("stops navigating on a single keypress", () => {
      // WCAG 2.1.4 — unmodified character shortcuts must be turn-off-able.
      setHotkeysEnabled(false);
      setup("/");
      fireKey("t");
      fireKey("j");
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("resumes once they are switched back on", () => {
      setHotkeysEnabled(false);
      setHotkeysEnabled(true);
      setup("/");
      fireKey("t");
      expect(mockPush).toHaveBeenCalledWith("/tools");
    });
  });
});
