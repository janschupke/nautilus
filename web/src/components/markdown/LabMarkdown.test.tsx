import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LabMarkdown } from "./LabMarkdown";

describe("LabMarkdown", () => {
  it("renders summary variant with GFM table headings", () => {
    const md = "## Scope\n\n| A | B |\n|---|---|\n| 1 | 2 |\n";
    render(<LabMarkdown markdown={md} variant="summary" />);
    expect(screen.getByRole("heading", { name: "Scope" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "1" })).toBeInTheDocument();
  });
});
