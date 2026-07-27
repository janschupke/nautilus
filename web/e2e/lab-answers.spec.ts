import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { LabTopic } from "../src/lib/types";

type TopicFixture = {
  moduleId: string;
  topic: LabTopic;
};

const TOPICS_ROOT = path.join(process.cwd(), "src/content/topics");

function loadTopicFixtures(): TopicFixture[] {
  return fs
    .readdirSync(TOPICS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const moduleId = entry.name;
      const dir = path.join(TOPICS_ROOT, moduleId);
      return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(".json"))
        .map((file) => {
          const raw = fs.readFileSync(path.join(dir, file), "utf8");
          return { moduleId, topic: JSON.parse(raw) as LabTopic };
        });
    })
    .sort((a, b) => a.topic.id.localeCompare(b.topic.id));
}

test.describe("lab answer acceptance", () => {
  for (const { moduleId, topic } of loadTopicFixtures()) {
    test(`${topic.id} accepts every expected answer`, async ({ page }) => {
      await page.addInitScript(() => {
        window.localStorage.clear();
      });
      await page.goto(`/${moduleId}/${topic.id}`);
      await expect(
        page.getByRole("heading", { name: topic.shortTitle }),
      ).toBeVisible();

      for (const [index, question] of topic.questions.entries()) {
        const trigger = page.getByRole("button", {
          name: new RegExp(`Question ${index + 1}\\b`),
        });
        if ((await trigger.getAttribute("aria-expanded")) !== "true") {
          await trigger.click();
        }

        const panel = page.locator(`[id="${topic.id}-${question.id}-panel"]`);
        await expect(panel).toBeVisible();

        await panel.getByLabel(/^Your answer/).fill(question.expectedOutput);
        await panel.getByRole("button", { name: "Check answer" }).click();
        await expect(trigger).toContainText("Correct");
      }
    });
  }
});
