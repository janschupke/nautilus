import { afterEach, describe, expect, it, vi } from "vitest";
import { prefersReducedMotion, scrollIntoViewNearest } from "./motion";

/** Minimal stand-in — jsdom has no layout, so rects are supplied directly. */
function makeElement(rect: { top: number; bottom: number }) {
  return {
    getBoundingClientRect: () => rect,
  } as unknown as HTMLElement;
}

function makeContainer(rect: { top: number; bottom: number }) {
  const scrollTo = vi.fn();
  const el = {
    getBoundingClientRect: () => rect,
    scrollTop: 100,
    scrollTo,
  } as unknown as HTMLElement;
  return { el, scrollTo };
}

describe("prefersReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is false when the media query does not match", () => {
    expect(prefersReducedMotion()).toBe(false);
  });

  it("is false when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("scrollIntoViewNearest", () => {
  it("does not scroll when the element is already visible", () => {
    // Not scrolling matters beyond efficiency: any scroll moves the browser's
    // sequential focus starting point away from the skip link.
    const { el: container, scrollTo } = makeContainer({ top: 0, bottom: 500 });
    scrollIntoViewNearest(container, makeElement({ top: 100, bottom: 140 }));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("scrolls up by the shortfall when the element is above the viewport", () => {
    const { el: container, scrollTo } = makeContainer({ top: 0, bottom: 500 });
    scrollIntoViewNearest(container, makeElement({ top: -30, bottom: 10 }));
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 70 }), // 100 - 30
    );
  });

  it("scrolls down by the overflow when the element is below the viewport", () => {
    const { el: container, scrollTo } = makeContainer({ top: 0, bottom: 500 });
    scrollIntoViewNearest(container, makeElement({ top: 510, bottom: 550 }));
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 150 }), // 100 + 50
    );
  });
});
