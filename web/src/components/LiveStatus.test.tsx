import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LiveAlert, LiveStatus } from "./LiveStatus";

describe("LiveStatus", () => {
  it("exposes the message through a polite status region", () => {
    render(<LiveStatus message="3 subnets allocated." />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("3 subnets allocated.");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("keeps the region mounted when the message is empty", () => {
    // A live region that appears together with its text is usually missed.
    const { rerender } = render(<LiveStatus message="" />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    rerender(<LiveStatus message="Copied code to clipboard" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Copied code to clipboard",
    );
  });

  it("is visually hidden", () => {
    render(<LiveStatus message="hello" />);
    expect(screen.getByRole("status")).toHaveClass("sr-only");
  });
});

describe("LiveAlert", () => {
  it("uses the assertive alert role", () => {
    render(<LiveAlert message="Invalid prefix" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid prefix");
  });
});
