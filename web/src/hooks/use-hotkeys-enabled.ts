"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_HOTKEYS_SNAPSHOT,
  parseHotkeysRaw,
  readHotkeysSnapshot,
  subscribeHotkeys,
} from "@/lib/storage";

/** Whether single-key navigation shortcuts are currently switched on. */
export function useHotkeysEnabled(): boolean {
  const raw = useSyncExternalStore(
    subscribeHotkeys,
    readHotkeysSnapshot,
    () => DEFAULT_HOTKEYS_SNAPSHOT,
  );
  return parseHotkeysRaw(raw).enabled;
}
