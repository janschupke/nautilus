import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResetProgressModal } from "./ResetProgressModal";

describe("ResetProgressModal", () => {
  it("renders nothing when closed", () => {
    render(
      <ResetProgressModal open={false} onClose={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with actions when open", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<ResetProgressModal open onClose={onClose} onConfirm={onConfirm} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("invokes onConfirm then onClose when confirming reset", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<ResetProgressModal open onClose={onClose} onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: /^Reset progress$/ }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(<ResetProgressModal open onClose={onClose} onConfirm={onConfirm} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
