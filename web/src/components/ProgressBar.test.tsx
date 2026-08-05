import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("exposes a name, bounds and a spoken value", () => {
    render(
      <ProgressBar
        correct={3}
        incorrect={2}
        total={10}
        label="Overall progress"
      />,
    );
    const bar = screen.getByRole("progressbar", { name: "Overall progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "10");
    // The incorrect count has no numeric slot of its own.
    expect(bar).toHaveAttribute(
      "aria-valuetext",
      "3 of 10 correct, 2 incorrect",
    );
  });

  it("renders nothing when there are no questions", () => {
    render(<ProgressBar correct={0} incorrect={0} total={0} label="Empty" />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
