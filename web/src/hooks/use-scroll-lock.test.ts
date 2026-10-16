import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useScrollLock } from "./use-scroll-lock";

const overflow = () => document.documentElement.style.overflow;

describe("useScrollLock", () => {
  it("locks the page while active and releases on deactivate", () => {
    const { rerender } = renderHook(({ active }) => useScrollLock(active), {
      initialProps: { active: true },
    });
    expect(overflow()).toBe("hidden");
    rerender({ active: false });
    expect(overflow()).toBe("");
  });

  it("does nothing while inactive", () => {
    renderHook(() => useScrollLock(false));
    expect(overflow()).toBe("");
  });

  it("stays locked until the last overlay closes", () => {
    const drawer = renderHook(() => useScrollLock(true));
    const modal = renderHook(() => useScrollLock(true));
    drawer.unmount();
    expect(overflow()).toBe("hidden");
    modal.unmount();
    expect(overflow()).toBe("");
  });
});
