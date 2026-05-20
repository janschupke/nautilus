"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { ProgressFileV1 } from "@/lib/types";
import {
  parseProgressRaw,
  readLabProgressSnapshot,
  subscribeLabProgress,
} from "@/lib/storage";

export function useLabProgressStore(): ProgressFileV1 {
  const json = useSyncExternalStore(
    subscribeLabProgress,
    readLabProgressSnapshot,
    () => "{}",
  );
  return useMemo(() => parseProgressRaw(json), [json]);
}
