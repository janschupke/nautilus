import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { HOTKEYS_KEY, loadHotkeys } from "@/lib/storage";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

describe("KeyboardShortcuts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens a dialog listing the shortcuts", async () => {
    const user = userEvent.setup();
    render(
      <div id="app-root">
        <KeyboardShortcuts />
      </div>,
    );
    await user.click(
      screen.getByRole("button", { name: "Keyboard shortcuts" }),
    );

    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Next topic")).toBeInTheDocument();
    expect(screen.getByText("Previous topic")).toBeInTheDocument();
  });

  it("shows shortcuts as enabled by default", async () => {
    const user = userEvent.setup();
    render(<KeyboardShortcuts />);
    await user.click(
      screen.getByRole("button", { name: "Keyboard shortcuts" }),
    );
    expect(screen.getByLabelText("Enable single-key shortcuts")).toBeChecked();
  });

  it("persists switching the shortcuts off and on again", async () => {
    const user = userEvent.setup();
    render(<KeyboardShortcuts />);
    await user.click(
      screen.getByRole("button", { name: "Keyboard shortcuts" }),
    );

    const toggle = screen.getByLabelText("Enable single-key shortcuts");
    await user.click(toggle);
    expect(loadHotkeys().enabled).toBe(false);
    expect(localStorage.getItem(HOTKEYS_KEY)).toBeTruthy();
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(loadHotkeys().enabled).toBe(true);
    expect(toggle).toBeChecked();
  });
});
