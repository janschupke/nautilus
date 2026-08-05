import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

function TwoButtonModal({ onClose = () => {} }: { onClose?: () => void }) {
  return (
    <Modal open onClose={onClose} title="Accepted answers">
      <button type="button">First</button>
      <button type="button">Second</button>
    </Modal>
  );
}

/** Mirrors the real usage: a trigger in the page that opens the dialog. */
function TriggerAndModal() {
  const [open, setOpen] = useState(false);
  return (
    <div id="app-root">
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Dialog">
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </Modal>
    </div>
  );
}

describe("Modal", () => {
  it("names the dialog from its visible title", () => {
    render(<TwoButtonModal />);
    expect(
      screen.getByRole("dialog", { name: "Accepted answers" }),
    ).toBeInTheDocument();
  });

  it("moves focus into the dialog when it opens", () => {
    render(<TwoButtonModal />);
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  });

  it("wraps Tab from the last focusable back to the first", async () => {
    const user = userEvent.setup();
    render(<TwoButtonModal />);
    screen.getByRole("button", { name: "Second" }).focus();
    await user.tab();
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  });

  it("wraps Shift+Tab from the first focusable back to the last", async () => {
    const user = userEvent.setup();
    render(<TwoButtonModal />);
    screen.getByRole("button", { name: "First" }).focus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus();
  });

  it("pulls focus back when it escapes the dialog", () => {
    render(
      <>
        <button type="button">Outside</button>
        <TwoButtonModal />
      </>,
    );
    const outside = screen.getByRole("button", { name: "Outside" });
    fireEvent.focusIn(outside, { target: outside });
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus();
  });

  it("returns focus to the opener when it closes", async () => {
    const user = userEvent.setup();
    render(<TriggerAndModal />);
    const opener = screen.getByRole("button", { name: "Open" });
    await user.click(opener);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("makes the app root inert while open and restores it on close", async () => {
    const user = userEvent.setup();
    render(<TriggerAndModal />);
    const root = document.getElementById("app-root")!;

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(root.hasAttribute("inert")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(root.hasAttribute("inert")).toBe(false);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<TwoButtonModal onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores Escape while closing is disabled", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Busy" closeDisabled>
        <button type="button">Only</button>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});
