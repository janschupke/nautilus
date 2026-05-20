import type {
  ProgressFileV1,
  QuestionResult,
  SidebarModulesFileV1,
  StoredTopicProgress,
} from "./types";

const STORAGE_KEY = "nautilus-lab-progress-v1";
export const SIDEBAR_CATEGORIES_KEY = "nautilus-sidebar-categories-v1";
const TOPIC_SUMMARY_KEY = "nautilus-topic-summary-v1";

const PROGRESS_VERSION = 1 as const;
const SIDEBAR_VERSION = 1 as const;

const PROGRESS_CHANGE_EVENT = "lab-progress-change";
const SIDEBAR_CATEGORIES_CHANGE_EVENT = "sidebar-categories-change";

export const DEFAULT_SIDEBAR_MODULES_SNAPSHOT = JSON.stringify({
  version: SIDEBAR_VERSION,
  collapsed: [],
} satisfies SidebarModulesFileV1);

function emptyQuestionState(): StoredTopicProgress["questions"][string] {
  return { draft: "", result: "idle", lastCheckedBody: null };
}

export function parseProgressRaw(raw: string | null): ProgressFileV1 {
  if (!raw) return { version: PROGRESS_VERSION, modules: {} };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as ProgressFileV1).version === PROGRESS_VERSION &&
      typeof (parsed as ProgressFileV1).modules === "object"
    ) {
      return parsed as ProgressFileV1;
    }
  } catch {
    // ignore corrupt storage
  }
  return { version: PROGRESS_VERSION, modules: {} };
}

export function loadProgress(): ProgressFileV1 {
  if (typeof window === "undefined") {
    return { version: PROGRESS_VERSION, modules: {} };
  }
  return parseProgressRaw(window.localStorage.getItem(STORAGE_KEY));
}

function notifyProgressListeners(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
}

export function saveProgress(state: ProgressFileV1): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  notifyProgressListeners();
}

export function clearAllProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  notifyProgressListeners();
}

export function clearTopicProgress(moduleId: string): void {
  if (typeof window === "undefined") return;
  const state = loadProgress();
  const next: ProgressFileV1 = {
    version: PROGRESS_VERSION,
    modules: { ...state.modules },
  };
  delete next.modules[moduleId];
  saveProgress(next);
}

export function clearTopicsProgress(moduleIds: readonly string[]): void {
  if (typeof window === "undefined") return;
  const state = loadProgress();
  const next: ProgressFileV1 = {
    version: PROGRESS_VERSION,
    modules: { ...state.modules },
  };
  for (const id of moduleIds) delete next.modules[id];
  saveProgress(next);
}

/** String snapshot for `useSyncExternalStore` (stable when storage unchanged). */
export function readLabProgressSnapshot(): string {
  if (typeof window === "undefined") return "{}";
  return window.localStorage.getItem(STORAGE_KEY) ?? "{}";
}

function makeStorageSubscriber(customEvent: string) {
  return function subscribe(onStoreChange: () => void): () => void {
    if (typeof window === "undefined") return () => {};
    const handler = () => onStoreChange();
    window.addEventListener("storage", handler);
    window.addEventListener(customEvent, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(customEvent, handler);
    };
  };
}

export const subscribeLabProgress = makeStorageSubscriber(
  PROGRESS_CHANGE_EVENT,
);

export function getQuestionState(
  state: ProgressFileV1,
  moduleId: string,
  questionId: string,
): StoredTopicProgress["questions"][string] {
  const mod = state.modules[moduleId];
  const q = mod?.questions[questionId];
  return q ?? emptyQuestionState();
}

export function setQuestionDraft(
  state: ProgressFileV1,
  moduleId: string,
  questionId: string,
  draft: string,
): ProgressFileV1 {
  const next: ProgressFileV1 = {
    version: PROGRESS_VERSION,
    modules: { ...state.modules },
  };
  const prevMod = state.modules[moduleId] ?? { questions: {} };
  const prevQ = prevMod.questions[questionId] ?? emptyQuestionState();
  next.modules[moduleId] = {
    questions: {
      ...prevMod.questions,
      [questionId]: { ...prevQ, draft },
    },
  };
  return next;
}

export function parseSidebarModulesRaw(
  raw: string | null,
): SidebarModulesFileV1 {
  if (!raw) {
    return { version: SIDEBAR_VERSION, collapsed: [] };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as SidebarModulesFileV1).version === SIDEBAR_VERSION &&
      Array.isArray((parsed as SidebarModulesFileV1).collapsed)
    ) {
      const collapsed = (parsed as SidebarModulesFileV1).collapsed.filter(
        (id): id is string => typeof id === "string",
      );
      return {
        version: SIDEBAR_VERSION,
        collapsed: [...new Set(collapsed)].sort(),
      };
    }
  } catch {
    // ignore corrupt storage
  }
  return { version: SIDEBAR_VERSION, collapsed: [] };
}

export function loadSidebarModules(): SidebarModulesFileV1 {
  if (typeof window === "undefined") {
    return { version: SIDEBAR_VERSION, collapsed: [] };
  }
  return parseSidebarModulesRaw(
    window.localStorage.getItem(SIDEBAR_CATEGORIES_KEY),
  );
}

function notifySidebarModulesListeners(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SIDEBAR_CATEGORIES_CHANGE_EVENT));
}

export function saveSidebarModules(state: SidebarModulesFileV1): void {
  if (typeof window === "undefined") return;
  const normalized: SidebarModulesFileV1 = {
    version: SIDEBAR_VERSION,
    collapsed: [...new Set(state.collapsed)].sort(),
  };
  window.localStorage.setItem(
    SIDEBAR_CATEGORIES_KEY,
    JSON.stringify(normalized),
  );
  notifySidebarModulesListeners();
}

export function toggleSidebarModuleCollapsed(categoryId: string): void {
  const cur = loadSidebarModules();
  const set = new Set(cur.collapsed);
  if (set.has(categoryId)) {
    set.delete(categoryId);
  } else {
    set.add(categoryId);
  }
  saveSidebarModules({ version: SIDEBAR_VERSION, collapsed: [...set].sort() });
}

/** Ensures a category section is expanded (no-op if already expanded). */
export function expandSidebarModule(categoryId: string): void {
  const cur = loadSidebarModules();
  if (!cur.collapsed.includes(categoryId)) return;
  saveSidebarModules({
    version: SIDEBAR_VERSION,
    collapsed: cur.collapsed.filter((id) => id !== categoryId),
  });
}

/** String snapshot for `useSyncExternalStore` (stable when storage unchanged). */
export function readSidebarModulesSnapshot(): string {
  if (typeof window === "undefined") {
    return DEFAULT_SIDEBAR_MODULES_SNAPSHOT;
  }
  return (
    window.localStorage.getItem(SIDEBAR_CATEGORIES_KEY) ??
    DEFAULT_SIDEBAR_MODULES_SNAPSHOT
  );
}

export const subscribeSidebarModules = makeStorageSubscriber(
  SIDEBAR_CATEGORIES_CHANGE_EVENT,
);

export function setQuestionResult(
  state: ProgressFileV1,
  moduleId: string,
  questionId: string,
  body: string,
  result: Exclude<QuestionResult, "idle">,
): ProgressFileV1 {
  const next: ProgressFileV1 = {
    version: PROGRESS_VERSION,
    modules: { ...state.modules },
  };
  const prevMod = state.modules[moduleId] ?? { questions: {} };
  const prevQ = prevMod.questions[questionId] ?? emptyQuestionState();
  next.modules[moduleId] = {
    questions: {
      ...prevMod.questions,
      [questionId]: {
        ...prevQ,
        draft: body,
        result,
        lastCheckedBody: body,
      },
    },
  };
  return next;
}

function readTopicSummaryCollapsed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(TOPIC_SUMMARY_KEY);
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x): x is string => typeof x === "string"));
    }
  } catch {
    // ignore corrupt storage
  }
  return new Set();
}

/** Returns `true` if the user has explicitly collapsed the summary for this topic. */
export function isTopicSummaryCollapsed(topicId: string): boolean {
  return readTopicSummaryCollapsed().has(topicId);
}

export function setTopicSummaryCollapsed(
  topicId: string,
  collapsed: boolean,
): void {
  if (typeof window === "undefined") return;
  const set = readTopicSummaryCollapsed();
  if (collapsed) {
    set.add(topicId);
  } else {
    set.delete(topicId);
  }
  window.localStorage.setItem(TOPIC_SUMMARY_KEY, JSON.stringify([...set]));
}
