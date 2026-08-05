import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { COPY_FEEDBACK_MS, CopyCodeBlock } from "./CopyCodeBlock";

const mockWriteText = vi.fn();

beforeEach(() => {
  mockWriteText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    configurable: true,
    writable: true,
  });
});

describe("CopyCodeBlock", () => {
  it("renders a Copy code button", () => {
    render(<CopyCodeBlock>echo hello</CopyCodeBlock>);
    expect(
      screen.getByRole("button", { name: "Copy code" }),
    ).toBeInTheDocument();
  });

  it("renders children inside a pre element", () => {
    render(<CopyCodeBlock>my code</CopyCodeBlock>);
    expect(screen.getByText("my code").closest("pre")).toBeTruthy();
  });

  it("applies extra className to the pre element", () => {
    const { container } = render(
      <CopyCodeBlock className="custom-class">code</CopyCodeBlock>,
    );
    expect(container.querySelector("pre")?.className).toContain("custom-class");
  });

  it("calls clipboard.writeText when the button is clicked", async () => {
    render(<CopyCodeBlock>copy me</CopyCodeBlock>);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    });
    expect(mockWriteText).toHaveBeenCalledOnce();
  });

  it("keeps the live region outside the copied element", async () => {
    // The block copies its own innerText, so a status region rendered inside
    // the <pre> would put "Copied code to clipboard" on the user's clipboard.
    // (jsdom has no innerText, so assert the structure rather than the call.)
    const { container } = render(<CopyCodeBlock>copy me</CopyCodeBlock>);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    });
    const pre = container.querySelector("pre")!;
    expect(screen.getByRole("status")).toHaveTextContent(/copied/i);
    expect(pre.contains(screen.getByRole("status"))).toBe(false);
    expect(pre.textContent).toBe("copy me");
  });

  it("announces the copy through a live region", async () => {
    render(<CopyCodeBlock>code</CopyCodeBlock>);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Copied code to clipboard",
    );
  });

  it("names the button and scroll region after the block's contents", () => {
    render(<CopyCodeBlock name="docker compose command">up -d</CopyCodeBlock>);
    expect(
      screen.getByRole("button", { name: "Copy docker compose command" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "docker compose command" }),
    ).toBeInTheDocument();
  });

  it("makes the scrollable block keyboard focusable", () => {
    const { container } = render(<CopyCodeBlock>code</CopyCodeBlock>);
    expect(container.querySelector("pre")).toHaveAttribute("tabindex", "0");
  });

  it("changes button label to Copied after click", async () => {
    render(<CopyCodeBlock>code</CopyCodeBlock>);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    });
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("reverts label back to Copy code after COPY_FEEDBACK_MS", async () => {
    vi.useFakeTimers();
    try {
      render(<CopyCodeBlock>code</CopyCodeBlock>);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
      });
      expect(
        screen.getByRole("button", { name: "Copied" }),
      ).toBeInTheDocument();
      await act(async () => {
        vi.advanceTimersByTime(COPY_FEEDBACK_MS + 1);
      });
      expect(
        screen.getByRole("button", { name: "Copy code" }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
