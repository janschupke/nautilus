import { expect, test, type Locator } from "@playwright/test";

async function expectSharedHeight(controls: Locator[], expectedHeight: number) {
  const heights = [];

  for (const control of controls) {
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    heights.push(Math.round(box!.height));
  }

  expect(new Set(heights)).toEqual(new Set([expectedHeight]));
}

test.describe("tools pages", () => {
  test("tools index links to every tool", async ({ page }) => {
    await page.goto("/tools");

    await expect(page.getByRole("heading", { name: "Tools" })).toBeVisible();

    await expect(
      page.getByRole("link", { name: /Subnetting calculator/ }),
    ).toHaveAttribute("href", "/tools/subnetting");
    await expect(
      page.getByRole("link", { name: /JSON formatter/ }),
    ).toHaveAttribute("href", "/tools/json");
    await expect(
      page.getByRole("link", { name: /Diffie-Hellman calculator/ }),
    ).toHaveAttribute("href", "/tools/dh");
  });

  test("JSON formatter validates, highlights, prettifies, minifies, and exposes icon copy", async ({
    page,
  }) => {
    await page.goto("/tools/json");

    await expect(
      page.getByRole("heading", { name: "JSON formatter" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Validate" })).toBeVisible();
    await expectSharedHeight(
      [
        page.getByRole("button", { name: "Prettify" }),
        page.getByRole("button", { name: "Minify" }),
        page.getByRole("button", { name: "Validate" }),
        page.getByRole("button", { name: "2" }),
        page.getByRole("button", { name: "4" }),
        page.getByRole("button", { name: "Clear" }),
      ],
      44,
    );

    await page.getByRole("button", { name: "Prettify" }).click();
    await expect(page.getByText(/JSON input is empty/)).toBeVisible();

    const input = page.getByLabel("Input");
    await input.fill('{\n"a": 1,\n}');
    await page.getByRole("button", { name: "Validate" }).click();

    await expect(page.getByText("Invalid JSON")).toBeVisible();
    await expect(
      page.getByText(/Trailing commas are invalid in JSON/),
    ).toBeVisible();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("json-error-underline")).toHaveText(",");

    await input.fill('{"a":1,"b":[true,null]}');
    await page.getByRole("button", { name: "Prettify" }).click();

    const output = page.getByRole("textbox", { name: "Output" });
    await expect(output).toHaveValue(
      '{\n  "a": 1,\n  "b": [\n    true,\n    null\n  ]\n}',
    );
    await expect(
      page.getByRole("button", { name: "Copy output" }).locator("svg"),
    ).toBeVisible();
    const copyButtonBox = await page
      .getByRole("button", { name: "Copy output" })
      .boundingBox();
    expect(copyButtonBox).not.toBeNull();
    expect(Math.round(copyButtonBox!.height)).toBe(32);

    await page.getByRole("button", { name: "Minify" }).click();
    await expect(output).toHaveValue('{"a":1,"b":[true,null]}');
  });

  test("subnetting calculator runs address info and subnet planner", async ({
    page,
  }) => {
    await page.goto("/tools/subnetting");

    await expect(
      page.getByRole("heading", { name: "Subnetting calculator" }),
    ).toBeVisible();
    await expectSharedHeight(
      [
        page.getByRole("button", { name: "IPv4" }),
        page.getByRole("button", { name: "IPv6" }),
        page.getByRole("button", { name: "Info" }),
        page.getByRole("button", { name: "Subnet planner" }),
        page.getByLabel("IPv4 address / prefix"),
        page.getByRole("button", { name: "Calculate" }),
      ],
      44,
    );

    await page.getByLabel("IPv4 address / prefix").fill("192.168.1.42/24");
    await page.getByRole("button", { name: "Calculate" }).click();
    await expect(page.getByText("Network address")).toBeVisible();
    await expect(page.getByText("192.168.1.0")).toBeVisible();
    await expect(page.getByText("192.168.1.255")).toBeVisible();

    await page.getByRole("button", { name: "Subnet planner" }).click();
    await page.getByLabel("Base network").fill("192.168.0.0/24");
    await expectSharedHeight(
      [
        page.getByLabel("Base network"),
        page.getByRole("button", { name: "Plan", exact: true }),
        page.getByRole("button", { name: "Add subnet" }),
        // Remove buttons are named after their row ("Remove Management").
        page.getByRole("button", { name: /^Remove / }).first(),
      ],
      44,
    );
    const hostInputs = page.getByPlaceholder("Hosts needed");
    await hostInputs.nth(0).fill("50");
    await hostInputs.nth(1).fill("25");
    await hostInputs.nth(2).fill("12");
    await page.getByRole("button", { name: "Plan", exact: true }).click();

    await expect(page.getByText("192.168.0.0/26")).toBeVisible();
    await expect(page.getByText("192.168.0.64/27")).toBeVisible();
    await expect(page.getByText("192.168.0.96/28")).toBeVisible();
  });

  test("Diffie-Hellman calculator derives a textbook exchange", async ({
    page,
  }) => {
    await page.goto("/tools/dh");

    await expect(
      page.getByRole("heading", { name: "Diffie-Hellman calculator" }),
    ).toBeVisible();
    await expectSharedHeight(
      [
        page.getByRole("button", { name: "Calculate" }),
        page.getByRole("button", { name: "Textbook (p=23)" }),
        page.getByRole("button", { name: "RFC 3526 group 14 (partial)" }),
        page.getByRole("button", { name: "Clear" }),
        page.locator("#dh-p"),
      ],
      44,
    );

    await page.getByRole("button", { name: "Textbook (p=23)" }).click();
    await page.getByRole("button", { name: "Calculate" }).click();

    await expect(page.locator("#dh-A")).toHaveValue("8");
    await expect(page.locator("#dh-B")).toHaveValue("19");
    await expect(page.locator("#dh-s")).toHaveValue("2");
    await expect(page.getByText(/Shared secret verified/)).toBeVisible();
  });
});
