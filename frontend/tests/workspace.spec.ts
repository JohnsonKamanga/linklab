import { test, expect } from "@playwright/test";
test("validates URLs, creates unique links, and persists them after reload", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Destination URL" });
  await input.fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Shorten link", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("valid URL");
  for (let i = 0; i < 2; i++) {
    await input.fill("https://example.org/a-new-page");
    await page
      .getByRole("button", { name: "Shorten link", exact: true })
      .click();
    await expect(page.locator(".created-result")).toBeVisible();
  }
  await page.reload();
  await page.getByRole("textbox", { name: "Search links" }).fill("example.org");
  await expect(page.locator(".links-table tbody tr")).toHaveCount(2);
  const codes = await page
    .locator(".links-table .short-link")
    .allTextContents();
  expect(new Set(codes).size).toBe(2);
});
test("copies, generates a downloadable QR code, and confirms deletion", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy a7Bx92Q", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "/a7Bx92Q",
  );
  await page
    .getByRole("button", { name: "QR code for a7Bx92Q", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("img")).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download PNG" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("linklab-a7Bx92Q.png");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("button", { name: "Delete .NET 8.0 release notes", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep link" }).click();
  await expect(
    page.getByRole("link", { name: ".NET 8.0 release notes", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete .NET 8.0 release notes", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete link", exact: true }).click();
  await expect(
    page.getByRole("link", { name: ".NET 8.0 release notes", exact: true }),
  ).toHaveCount(0);
  await page.goto("/a7Bx92Q");
  await expect(
    page.getByRole("heading", { name: "This link took a wrong turn." }),
  ).toBeVisible();
});
test("routes to analytics, filters sources, exports links, and handles unknown routes", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", {
      name: "Analytics for .NET 8.0 release notes",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/links\/demo-0$/);
  await expect(
    page.getByRole("heading", { name: "Behind every click." }),
  ).toBeVisible();
  await expect(page.locator(".click-chart svg").first()).toBeVisible();
  await page
    .getByRole("textbox", { name: "Filter recent activity by referrer" })
    .fill("no-such-referrer");
  await expect(
    page.getByRole("heading", { name: "No matching visits" }),
  ).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export links", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("linklab-links.csv");
  await page.goto("/does/not/exist");
  await expect(
    page.getByRole("heading", { name: "This link took a wrong turn." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to your links" }).click();
  await expect(page).toHaveURL(/\/$/);
});
test("short codes redirect once and record one click", async ({ page }) => {
  await page.goto("/");
  const count = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("linklab.links.v1")!).find(
        (l: { code: string }) => l.code === "a7Bx92Q",
      ).events.length,
  );
  await page.route(
    "https://github.com/dotnet/aspnetcore/releases/tag/v8.0.0",
    (route) =>
      route.fulfill({ body: "Destination reached", contentType: "text/html" }),
  );
  await page.goto("/a7Bx92Q");
  await expect(page).toHaveURL(
    "https://github.com/dotnet/aspnetcore/releases/tag/v8.0.0",
  );
  await page.goto("/");
  const next = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("linklab.links.v1")!).find(
        (l: { code: string }) => l.code === "a7Bx92Q",
      ).events.length,
  );
  expect(next).toBe(count + 1);
});
test("mobile navigation, empty states, pagination, and theme remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search links" })
    .fill("nothing-found");
  await expect(
    page.getByRole("heading", { name: "No links found" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear search", exact: true })
    .last()
    .click();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  await page.reload();
  await expect(page.locator("html")).toHaveClass("dark");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Analytics" })
    .click();
  await expect(
    page.getByRole("heading", { name: "The bigger picture." }),
  ).toBeVisible();
});
