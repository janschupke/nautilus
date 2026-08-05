import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useHotkeys } from "./use-hotkeys";

/** Dispatch a keydown event that bubbles from document.body up to window. */
function fireKey(key: string, init: KeyboardEventInit = {}) {
  document.body.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...init }),
  );
}

describe("useHotkeys", () => {
  it("calls the matching action on keydown", () => {
    const action = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", action }]));
    fireKey("a");
    expect(action).toHaveBeenCalledOnce();
  });

  it("does not call action for unregistered keys", () => {
    const action = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", action }]));
    fireKey("b");
    expect(action).not.toHaveBeenCalled();
  });

  it("calls only the matching action when multiple are registered", () => {
    const onA = vi.fn();
    const onB = vi.fn();
    renderHook(() =>
      useHotkeys([
        { key: "a", action: onA },
        { key: "b", action: onB },
      ]),
    );
    fireKey("a");
    expect(onA).toHaveBeenCalledOnce();
    expect(onB).not.toHaveBeenCalled();
  });

  it("ignores events with metaKey", () => {
    const action = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", action }]));
    fireKey("a", { metaKey: true });
    expect(action).not.toHaveBeenCalled();
  });

  it("ignores events with ctrlKey", () => {
    const action = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", action }]));
    fireKey("a", { ctrlKey: true });
    expect(action).not.toHaveBeenCalled();
  });

  it("ignores events with altKey", () => {
    const action = vi.fn();
    renderHook(() => useHotkeys([{ key: "a", action }]));
    fireKey("a", { altKey: true });
    expect(action).not.toHaveBeenCalled();
  });

  describe("ignores events when a form element is focused", () => {
    let el: HTMLElement;

    afterEach(() => {
      el?.remove();
    });

    it("input", () => {
      el = document.createElement("input");
      document.body.appendChild(el);
      el.focus();
      const action = vi.fn();
      renderHook(() => useHotkeys([{ key: "a", action }]));
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", bubbles: true }),
      );
      expect(action).not.toHaveBeenCalled();
    });

    it("textarea", () => {
      el = document.createElement("textarea");
      document.body.appendChild(el);
      el.focus();
      const action = vi.fn();
      renderHook(() => useHotkeys([{ key: "a", action }]));
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", bubbles: true }),
      );
      expect(action).not.toHaveBeenCalled();
    });

    it("select", () => {
      el = document.createElement("select");
      document.body.appendChild(el);
      el.focus();
      const action = vi.fn();
      renderHook(() => useHotkeys([{ key: "a", action }]));
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", bubbles: true }),
      );
      expect(action).not.toHaveBeenCalled();
    });

    it("contenteditable", () => {
      el = document.createElement("div");
      el.contentEditable = "true";
      document.body.appendChild(el);
      el.focus();
      const action = vi.fn();
      renderHook(() => useHotkeys([{ key: "a", action }]));
      el.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", bubbles: true }),
      );
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe("suppression by widget role", () => {
    let el: HTMLElement | null = null;

    afterEach(() => {
      el?.remove();
      el = null;
    });

    for (const role of ["textbox", "searchbox", "combobox", "spinbutton"]) {
      it(`ignores keys typed into a role="${role}" widget`, () => {
        el = document.createElement("div");
        el.setAttribute("role", role);
        el.tabIndex = 0;
        document.body.appendChild(el);
        el.focus();
        const action = vi.fn();
        renderHook(() => useHotkeys([{ key: "a", action }]));
        el.dispatchEvent(
          new KeyboardEvent("keydown", { key: "a", bubbles: true }),
        );
        expect(action).not.toHaveBeenCalled();
      });
    }
  });

  it("ignores keys while a modal dialog is open", () => {
    // Otherwise a shortcut navigates the router out from under the dialog.
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    document.body.appendChild(dialog);
    try {
      const action = vi.fn();
      renderHook(() => useHotkeys([{ key: "a", action }]));
      fireKey("a");
      expect(action).not.toHaveBeenCalled();
    } finally {
      dialog.remove();
    }
  });

  it("removes the listener on unmount", () => {
    const action = vi.fn();
    const { unmount } = renderHook(() => useHotkeys([{ key: "a", action }]));
    unmount();
    fireKey("a");
    expect(action).not.toHaveBeenCalled();
  });

  it("reads the latest hotkeys after re-render", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ action }) => useHotkeys([{ key: "a", action }]),
      { initialProps: { action: first } },
    );
    rerender({ action: second });
    fireKey("a");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
  });
});
