import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * Only `violations` are asserted. The fixed decorative background images make
 * axe report *incomplete* colour-contrast results on some elements, which it
 * cannot resolve without a human — those are not failures.
 */
async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_AA_TAGS)
    .analyze();
  expect(
    violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target.join(" ")),
    })),
  ).toEqual([]);
}

const ROUTES = [
  "/",
  "/lab-setup",
  "/stats",
  "/tools",
  "/tools/subnetting",
  "/tools/json",
  "/tools/dh",
  "/rtfm",
  "/rtfm/nmap",
  "/basics",
];

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    test(`${route} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      await expectNoViolations(page);
    });
  }

  test("a topic page has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/basics/05-awk", { waitUntil: "networkidle" });
    // The lab UI is client-only; wait for it before scanning.
    await expect(
      page.getByRole("button", { name: /Question 1\b/ }),
    ).toBeVisible();
    await expectNoViolations(page);
  });

  test("an open dialog has no WCAG A/AA violations", async ({ page }) => {
    await page.goto("/basics/05-awk", { waitUntil: "networkidle" });
    // The first unanswered question is expanded on load — only toggle if not.
    const trigger = page.getByRole("button", { name: /Question 1\b/ });
    if ((await trigger.getAttribute("aria-expanded")) !== "true") {
      await trigger.click();
    }
    await page.getByRole("button", { name: "Accepted answers" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoViolations(page);
  });

  test("the mobile drawer has no WCAG A/AA violations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/stats", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expectNoViolations(page);
  });

  test("skip link moves focus to the main region", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  // The sidebar reveals the active topic on load. Doing that with
  // scrollIntoView moves the browser's sequential focus starting point into
  // the sidebar, so the first Tab would skip past the skip link entirely.
  for (const route of ["/basics", "/basics/05-awk"]) {
    test(`${route} still puts the skip link first in the tab order`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: "Skip to main content" }),
      ).toBeFocused();
    });
  }

  test("sidebar topic links show a visible focus indicator", async ({
    page,
  }) => {
    // axe cannot detect a missing focus ring, and these links previously had
    // `outline-none` with no replacement.
    await page.goto("/basics/05-awk", { waitUntil: "networkidle" });
    const link = page
      .getByRole("navigation", { name: "Modules" })
      .getByRole("link", { name: /awk for fields/i })
      .first();
    const shadowBefore = await link.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    await link.focus();
    const shadowAfter = await link.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    expect(shadowAfter).not.toBe(shadowBefore);
    expect(shadowAfter).not.toBe("none");
  });

  test("the drawer traps focus and Escape returns it to the toggle", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/stats", { waitUntil: "networkidle" });
    const toggle = page.getByRole("button", { name: "Open navigation" });
    await toggle.click();

    const insideDrawer = await page.evaluate(() =>
      document
        .getElementById("course-navigation")
        ?.contains(document.activeElement),
    );
    expect(insideDrawer).toBe(true);

    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
  });

  test("single-key shortcuts can be switched off", async ({ page }) => {
    await page.goto("/stats", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Keyboard shortcuts" }).click();
    await page.getByLabel("Enable single-key shortcuts").uncheck();
    await page.getByRole("button", { name: "Close" }).click();

    await page.keyboard.press("t");
    await expect(page).toHaveURL(/\/stats$/);

    // …and back on again.
    await page.getByRole("button", { name: "Keyboard shortcuts" }).click();
    await page.getByLabel("Enable single-key shortcuts").check();
    await page.getByRole("button", { name: "Close" }).click();
    await page.keyboard.press("t");
    await expect(page).toHaveURL(/\/tools$/);
  });
});
