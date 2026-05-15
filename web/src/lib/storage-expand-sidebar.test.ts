import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  expandSidebarModule,
  loadSidebarModules,
  saveSidebarModules,
} from "./storage";

function mockStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
    removeItem(key: string) {
      map.delete(key);
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
  };
}

describe("expandSidebarModule", () => {
  beforeEach(() => {
    const ls = mockStorage();
    vi.stubGlobal("window", {
      localStorage: ls,
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("removes the module from collapsed when it was collapsed", () => {
    saveSidebarModules({
      version: 1,
      collapsed: ["basics", "networking"],
    });
    expandSidebarModule("basics");
    expect(loadSidebarModules()).toEqual({
      version: 1,
      collapsed: ["networking"],
    });
  });

  it("is a no-op when the module is not collapsed", () => {
    saveSidebarModules({ version: 1, collapsed: ["networking"] });
    expandSidebarModule("basics");
    expect(loadSidebarModules()).toEqual({
      version: 1,
      collapsed: ["networking"],
    });
  });

  it("is a no-op when nothing is collapsed", () => {
    saveSidebarModules({ version: 1, collapsed: [] });
    expandSidebarModule("basics");
    expect(loadSidebarModules()).toEqual({ version: 1, collapsed: [] });
  });
});
