import { MODULE_IDS } from "@/content/manifest";

/**
 * `'/[moduleId]'` → moduleId, or `null`.
 * Validates against the known set of module ids so static routes like
 * `/tools` or `/stats` are never mistaken for module pages.
 */
export function moduleIdFromPathname(pathname: string | null): string | null {
  if (!pathname) return null;
  const m = /^\/([^/]+)\/?$/.exec(pathname);
  if (!m || !m[1]) return null;
  const id = decodeURIComponent(m[1]);
  return MODULE_IDS.has(id) ? id : null;
}

/**
 * `'/[moduleId]/[topicId]'` → `{ moduleId, topicId }`, or `null`.
 */
export function topicRouteFromPathname(
  pathname: string | null,
): { moduleId: string; topicId: string } | null {
  if (!pathname) return null;
  const m = /^\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (!m || !m[1] || !m[2]) return null;
  const moduleId = decodeURIComponent(m[1]);
  if (!MODULE_IDS.has(moduleId)) return null;
  return { moduleId, topicId: decodeURIComponent(m[2]) };
}

/**
 * Returns the topic id when on a topic page, or `null` otherwise.
 * Handles the `'/[moduleId]/[topicId]'` route shape.
 */
export function topicIdFromPathname(pathname: string | null): string | null {
  return topicRouteFromPathname(pathname)?.topicId ?? null;
}
