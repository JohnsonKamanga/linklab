import { test, expect } from "@playwright/test";

const link = {
  id: "theme-link",
  originalUrl: "https://example.com/design-system",
  shortCode: "design1",
  shortUrl: "http://localhost/design1",
  createdAt: "2026-11-01T12:00:00Z",
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/links", (route) => route.fulfill({ json: [link] }));
  await page.route("**/api/links/*/analytics", (route) =>
    route.fulfill({
      json: {
        totalClicks: 12,
        clicksToday: 2,
        clicksLast7Days: 12,
        lastAccessedAt: null,
        dailyClicks: [],
        topReferrers: [],
        recentClicks: [],
      },
    }),
  );
});

test("follows system theme until an explicit preference is saved", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 10, 10)",
  );
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass("dark");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#0a0a0a",
  );
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
});

test("search retains a visible focus indicator in both themes", async ({
  page,
}) => {
  await page.goto("/");
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    const search = page.getByRole("textbox", { name: "Search links" });
    await search.focus();
    await expect(search).toBeFocused();
    await expect(page.locator(".search-input")).not.toHaveCSS(
      "box-shadow",
      "none",
    );
    await search.fill("no-match");
    await expect(
      page.getByRole("heading", { name: "No links found" }),
    ).toBeVisible();
    await search.fill("");
  }
});

test("theme stays synchronized between tabs", async ({ page, context }) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/guide");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(other.locator("html")).toHaveClass("dark");
  await expect(
    other.getByRole("button", { name: "Switch to light theme" }),
  ).toBeVisible();
});

test("narrow dark layouts retain readable text and reachable actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "example.com", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  await expect(page.locator(".destination-url")).toHaveCSS("font-size", "12px");
  await page
    .getByRole("button", { name: "QR code for design1", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("img")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
