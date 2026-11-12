import { test, expect, type Page } from "@playwright/test";

const examples = Array.from({ length: 8 }, (_, index) => ({
  id: `mobile-${index}`,
  originalUrl:
    index === 0
      ? "https://vercel.com/docs/deployments/overview"
      : index === 1
        ? "https://vercel.com/docs/analytics"
        : `https://example.com/reading-list/${index}/a-long-destination-that-needs-to-wrap`,
  shortCode: `mobile${index}`,
  createdAt: new Date(Date.UTC(2026, 10, 12 - index)).toISOString(),
}));

async function mockWorkspace(page: Page, empty = false) {
  let links = empty ? [] : [...examples];
  await page.route("**/api/links", async (route) => {
    if (route.request().method() === "POST") {
      const added = {
        id: "created-mobile",
        shortCode: "newlink",
        originalUrl: route.request().postDataJSON().originalUrl,
        createdAt: new Date().toISOString(),
      };
      links = [added, ...links];
      return route.fulfill({ json: added });
    }
    return route.fulfill({ json: links });
  });
  await page.route("**/api/links/*", (route) => {
    links = links.filter(
      (link) => !route.request().url().endsWith(`/${link.id}`),
    );
    return route.fulfill({ status: 204 });
  });
  await page.route("**/api/links/*/analytics", (route) =>
    route.fulfill({
      json: {
        totalClicks: 231,
        clicksToday: 44,
        clicksLast7Days: 231,
        lastAccessedAt: null,
        dailyClicks: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000)
            .toISOString()
            .slice(0, 10),
          count: [14, 25, 19, 42, 31, 56, 44][i],
        })),
        topReferrers: [{ domain: "github.com", count: 231 }],
        recentClicks: [
          {
            at: "2026-11-12T08:00:00Z",
            referrer: "github.com/a-very-long-referrer-path",
          },
        ],
      },
    }),
  );
}

test.use({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });

async function capture(page: Page, name: string) {
  if (process.env.MOBILE_REVIEW_DIR) {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `${process.env.MOBILE_REVIEW_DIR}/${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  }
}

test("puts working links above the fold without overflow at phone widths", async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Links", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Destination URL" }),
  ).toBeHidden();
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const rows = page.locator(".mobile-link-row");
    await expect(rows).toHaveCount(6);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    const second = await rows.nth(1).boundingBox();
    expect(second!.y + second!.height).toBeLessThan(844);
    const copy = await rows
      .first()
      .getByRole("button", { name: "Copy mobile0", exact: true })
      .boundingBox();
    expect(copy!.height).toBeGreaterThanOrEqual(44);
    await capture(page, `links-dark-${width}`);
  }
  await page.emulateMedia({ colorScheme: "light" });
  await capture(page, "links-light-430");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".links-table")).toBeVisible();
  await expect(page.locator(".mobile-link-list")).toBeHidden();
  await expect(
    page.getByRole("textbox", { name: "Destination URL" }),
  ).toBeVisible();
  await capture(page, "links-desktop-light");
});

test("composer preserves drafts and exposes validation and success", async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.goto("/");
  await page.getByRole("button", { name: "New link", exact: true }).click();
  const input = page.getByRole("textbox", { name: "Destination URL" });
  await expect(input).toBeFocused();
  await input.fill("https://example.org/my-draft");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "New link", exact: true }).click();
  await expect(input).toHaveValue("https://example.org/my-draft");
  await input.fill("not-a-url");
  await page.getByRole("button", { name: "Shorten link", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("valid URL");
  await input.fill("https://example.org/my-draft");
  await page.getByRole("button", { name: "Shorten link", exact: true }).click();
  await expect(page.locator(".created-result")).toContainText("Ready to share");
  await expect(page.locator(".mobile-link-list")).toContainText(
    "example.org/my-draft",
  );
  await expect(
    page.getByRole("button", { name: "Shorten link", exact: true }),
  ).toBeEnabled();
  await capture(page, "composer-success");
});

test("copy is immediate and secondary actions remain reachable", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await mockWorkspace(page);
  await page.goto("/");
  const copy = page
    .locator(".mobile-link-row")
    .first()
    .getByRole("button", { name: "Copy mobile0", exact: true });
  await copy.click();
  await expect(copy).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "/mobile0",
  );
  await expect(page.locator(".toast")).toHaveCount(0);
  const more = page.getByRole("button", {
    name: "More actions for mobile0",
    exact: true,
  });
  await more.click();
  await capture(page, "link-actions-menu");
  await page
    .getByRole("menuitem", { name: "Show QR code", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("img")).toBeVisible();
  await capture(page, "qr-dialog");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await more.click();
  await page
    .getByRole("menuitem", { name: "Delete link", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep link", exact: true }).click();
  await expect(page.locator(".mobile-link-list")).toContainText(
    "vercel.com/docs/deployments/overview",
  );
  await more.click();
  await page
    .getByRole("menuitem", { name: "View analytics", exact: true })
    .click();
  await expect(page).toHaveURL(/\/links\/mobile-0$/);
});

test("search, sorting, export and pagination remain discoverable", async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.locator(".mobile-link-row")).toHaveCount(2);
  await page.getByRole("textbox", { name: "Search links" }).fill("vercel.com");
  await expect(page.locator(".mobile-link-row")).toHaveCount(2);
  await page.getByRole("button", { name: "List options", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Oldest first", exact: true })
    .click();
  await expect(page.locator(".mobile-link-row").first()).toContainText(
    "vercel.com/docs/analytics",
  );
  await page.getByRole("button", { name: "List options", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "Export CSV", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("linklab-links.csv");
  await page.getByRole("textbox", { name: "Search links" }).fill("no-matches");
  await expect(
    page.getByRole("heading", { name: "No links found" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear search", exact: true })
    .last()
    .click();
  await expect(page.locator(".mobile-link-row")).toHaveCount(6);
});

test("empty workspaces show the composer and workspace menu supports keyboard use", async ({
  page,
}) => {
  await mockWorkspace(page, true);
  await page.goto("/");
  await expect(
    page.getByRole("textbox", { name: "Destination URL" }),
  ).toBeVisible();
  const menu = page.getByRole("button", {
    name: "Workspace menu",
    exact: true,
  });
  await menu.focus();
  await page.keyboard.press("Enter");
  await page
    .getByRole("menuitem", { name: "Switch to light theme", exact: true })
    .click();
  await expect(page.locator("html")).not.toHaveClass("dark");
  await expect(menu).toBeFocused();
  await expect(
    page.getByRole("textbox", { name: "Search links" }),
  ).toBeHidden();
  await capture(page, "empty-light");
});

test("analytics has two primary figures and readable activity without a sideways table", async ({
  page,
}) => {
  await mockWorkspace(page);
  await page.goto("/analytics");
  await expect(page.locator(".metric:visible")).toHaveCount(2);
  await expect(page.locator(".mobile-activity-list")).toBeVisible();
  await expect(page.locator(".activity-table")).toBeHidden();
  await page.locator(".click-chart svg").first().waitFor();
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(700);
  await capture(page, "analytics-dark");
  await page.getByText("More metrics", { exact: true }).click();
  await expect(
    page.getByText("Clicks today · UTC", { exact: true }),
  ).toBeVisible();
});
