#!/usr/bin/env node
/**
 * Copies each course module's `summary.md` (repo root: `<moduleId>/summary.md`)
 * into the matching lab JSON as `summaryMarkdown`.
 *
 * Strips the leading `# Module …` line so the page title + intro stay primary.
 *
 * Usage (from `web/`): `node scripts/sync-module-summaries.mjs`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const modulesDir = path.join(webRoot, "src/content/modules");
const repoRoot = path.join(webRoot, "..");

/** Remove first `# …` heading (module title duplicates UI `shortTitle`). */
function stripLeadingModuleH1(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  if (lines[0]?.startsWith("# ")) {
    let i = 1;
    while (i < lines.length && lines[i]?.trim() === "") i += 1;
    return lines.slice(i).join("\n").replace(/^\n+/, "");
  }
  return md.replace(/\r\n/g, "\n");
}

let updated = 0;
for (const file of fs.readdirSync(modulesDir)) {
  if (!file.endsWith(".json")) continue;
  const jpath = path.join(modulesDir, file);
  const mod = JSON.parse(fs.readFileSync(jpath, "utf8"));
  if (!mod.id || typeof mod.id !== "string") {
    console.warn("skip (no id):", file);
    continue;
  }
  const sumPath = path.join(repoRoot, mod.id, "summary.md");
  if (!fs.existsSync(sumPath)) {
    console.warn("missing summary:", mod.id);
    continue;
  }
  const raw = fs.readFileSync(sumPath, "utf8");
  const summaryMarkdown = stripLeadingModuleH1(raw.trimEnd());
  fs.writeFileSync(
    jpath,
    JSON.stringify({ ...mod, summaryMarkdown }, null, 2) + "\n",
  );
  updated += 1;
}
console.log("sync-module-summaries:", updated, "files");
