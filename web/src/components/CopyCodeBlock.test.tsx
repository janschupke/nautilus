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
