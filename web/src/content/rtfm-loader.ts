import fs from "fs/promises";
import path from "path";

export async function loadCheatsheet(slug: string): Promise<string | null> {
  try {
    const file = path.join(process.cwd(), "src/content/rtfm", `${slug}.md`);
    return await fs.readFile(file, "utf-8");
  } catch {
    return null;
  }
}
