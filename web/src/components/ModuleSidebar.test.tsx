import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LAB_MODULE_QUESTION_IDS } from "@/content/lab-module-question-ids";
import * as storage from "@/lib/storage";
import { SIDEBAR_CATEGORIES_KEY } from "@/lib/storage";
import type { ProgressFileV1 } from "@/lib/types";
import { ModuleSidebar } from "./ModuleSidebar";

/** Find the module heading link by its href (unambiguous). */
function getModuleLink(moduleId: string) {
  return screen
    .getAllByRole("link")
    .find((el) => el.getAttribute("href") === `/${moduleId}`);
}

const pathnameRef = { current: "/" as string };

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameRef.current,
}));

function progressAllCorrect(topicId: string): ProgressFileV1 {
  const qids = LAB_MODULE_QUESTION_IDS[topicId];
  if (!qids) throw new Error(`unknown topic ${topicId}`);
  return {
    version: 1,
    modules: {
      [topicId]: {
        questions: Object.fromEntries(
          qids.map((id) => [
            id,
            {
              draft: "x",
              result: "correct" as const,
              lastCheckedBody: "x",
            },
          ]),
        ),
      },
    },
  };
}

describe("ModuleSidebar", () => {
  beforeEach(() => {
    pathnameRef.current = "/";
    localStorage.clear();
  });

  it("renders course title and module headings as links", () => {
    render(<ModuleSidebar isOpen={false} onClose={() => {}} />);
    expect(screen.getByRole("link", { name: "Nautilus" })).toHaveAttribute(
      "href",
      "/",
    );
    // Module headings are links (not buttons) — caret is a separate button.
    // Query by href to avoid false matches with same-named topic links.
    for (const id of [
      "basics",
      "filesystem",
      "processes-and-users",
      "net-theory",
      "networking",
      "exploitation",
      "forensics",
    ]) {
      expect(getModuleLink(id)).toBeDefined();
    }
  });

  it("expands the module for the active topic when it was collapsed", async () => {
    pathnameRef.current = "/basics/05-awk";
    const spy = vi.spyOn(storage, "expandSidebarModule");
    localStorage.setItem(
      SIDEBAR_CATEGORIES_KEY,
      JSON.stringify({ version: 1, collapsed: ["basics"] }),
    );
    render(<ModuleSidebar isOpen={false} onClose={() => {}} />);
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("basics");
    });
    const raw = localStorage.getItem(SIDEBAR_CATEGORIES_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).collapsed).not.toContain("basics");
  });

  it("links to a wired topic route", () => {
    pathnameRef.current = "/";
    render(<ModuleSidebar isOpen={false} onClose={() => {}} />);
    const awk = screen.getByRole("link", { name: /05 — awk for fields/i });
    expect(awk).toHaveAttribute("href", "/basics/05-awk");
  });

  it("applies emerald styling to fully correct topics", () => {
    pathnameRef.current = "/";
    storage.saveProgress(progressAllCorrect("01-find"));
    render(<ModuleSidebar isOpen={false} onClose={() => {}} />);
    const link = screen.getByRole("link", { name: /01 — finding files/i });
    expect(link.className).toMatch(/emerald/);
  });

  it("applies stronger active styling when the current topic is fully correct", () => {
    pathnameRef.current = "/filesystem/01-find";
    storage.saveProgress(progressAllCorrect("01-find"));
    render(<ModuleSidebar isOpen={false} onClose={() => {}} />);
    const link = screen.getByRole("link", { name: /01 — finding files/i });
    expect(link.className).toMatch(/ring-2/);
    expect(link.className).toMatch(/emerald/);
  });

  it("does not render progress rings when no answers have been checked", () => {
    pathnameRef.current = "/";
    render(<ModuleSidebar isOpen={false} onClose={() => {}} />);
    expect(
      screen.queryAllByRole("img", { name: /questions correct/i }),
    ).toHaveLength(0);
  });

  it("shows a progress ring with correct/total in an accessible label", () => {
    pathnameRef.current = "/";
    const topicId = "01-find";
    const qids = LAB_MODULE_QUESTION_IDS[topicId]!;
    const questions: ProgressFileV1["modules"][string]["questions"] = {
      [qids[0]!]: {
        draft: "a",
        result: "correct",
        lastCheckedBody: "a",
      },
    };
    for (let i = 1; i < qids.length; i++) {
      questions[qids[i]!] = {
        draft: "",
        result: "idle",
        lastCheckedBody: null,
      };
    }
    storage.saveProgress({
      version: 1,
      modules: { [topicId]: { questions } },
    });
    render(<ModuleSidebar isOpen={false} onClose={() => {}} />);
    expect(
      screen.getByRole("img", {
        name: new RegExp(`^1 of ${qids.length} questions correct$`),
      }),
    ).toBeInTheDocument();
  });
});
