import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test, expect, type Page } from "@playwright/test";
import type jsQR from "jsqr";

const decoderPath = createRequire(import.meta.url).resolve("jsqr");

async function decodeImage(page: Page, source: string, size: number) {
  await page.addScriptTag({ path: decoderPath });
  return page.evaluate(
    async ({ source, size }) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0, size, size);
      const decode = (window as Window & { jsQR: typeof jsQR }).jsQR;
      return decode(context.getImageData(0, 0, size, size).data, size, size, {
        inversionAttempts: "dontInvert",
      });
    },
    { source, size },
  );
}

async function expectCenteredLogo(
  page: Page,
  source: string,
  version: number,
) {
  const samples = await page.evaluate(
    async ({ source, version }) => {
      const [qr, logo] = [new Image(), new Image()];
      qr.src = source;
      logo.src = "/linlklab-logo-only.png";
      await Promise.all([qr.decode(), logo.decode()]);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = qr.naturalWidth;
      const context = canvas.getContext("2d")!;
      context.drawImage(qr, 0, 0);
      const reference = document.createElement("canvas");
      reference.width = reference.height = logo.naturalWidth;
      const referenceContext = reference.getContext("2d")!;
      referenceContext.fillStyle = "#efeddf";
      referenceContext.fillRect(0, 0, reference.width, reference.height);
      referenceContext.drawImage(logo, 0, 0);

      const modules = version * 4 + 17;
      const tileSize =
        (Math.max(5, Math.floor(modules * 0.17) | 1) * qr.naturalWidth) /
        (modules + 8);
      const tileStart = (qr.naturalWidth - tileSize) / 2;
      // Both halves of the supplied mark and the clear space between them.
      const points = [
        [0.29, 0.3],
        [0.61, 0.3],
        [0.35, 0.74],
        [0.74, 0.74],
        [0.48, 0.4],
        [0.2, 0.2],
      ];
      return points.map(([x, y]) => ({
        actual: Array.from(
          context.getImageData(
            Math.floor(tileStart + x * tileSize),
            Math.floor(tileStart + y * tileSize),
            1,
            1,
          ).data,
        ),
        expected: Array.from(
          referenceContext.getImageData(
            Math.floor(x * reference.width),
            Math.floor(y * reference.height),
            1,
            1,
          ).data,
        ),
      }));
    },
    { source, version },
  );
  for (const { actual, expected } of samples) {
    for (let channel = 0; channel < 4; channel++) {
      expect(Math.abs(actual[channel] - expected[channel])).toBeLessThanOrEqual(
        8,
      );
    }
  }
}

test("branded preview and downloaded PNG scan to the short URL", async ({
  page,
}) => {
  await page.goto("/");
  const expectedUrl = new URL("/a7Bx92Q", page.url()).href;
  await page
    .getByRole("button", { name: "QR code for a7Bx92Q", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  const preview = dialog.getByRole("img", { name: /LinkLab logo/i });
  await expect(preview).toBeVisible();
  const source = await preview.getAttribute("src");
  expect(source).toMatch(/^data:image\/png;base64,/);
  const dimensions = await preview.evaluate((image: HTMLImageElement) => ({
    width: image.naturalWidth,
    height: image.naturalHeight,
  }));
  expect(dimensions).toEqual({ width: 1200, height: 1200 });

  const decoded = await decodeImage(page, source!, 1200);
  expect(decoded?.data).toBe(expectedUrl);
  expect((await decodeImage(page, source!, 256))?.data).toBe(expectedUrl);
  await expectCenteredLogo(page, source!, decoded!.version);

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("link", { name: "Download PNG" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("linklab-a7Bx92Q.png");
  const downloaded = await readFile((await download.path())!);
  expect(downloaded.equals(Buffer.from(source!.split(",")[1], "base64"))).toBe(
    true,
  );
});

test("branded QR stays scannable for a long URL at export and preview sizes", async ({
  page,
}) => {
  await page.goto("/");
  const expectedUrl = `https://linklab.example/${"a".repeat(160)}`;
  const source = await page.evaluate(
    async ({ modulePath, url }) => {
      const { createBrandedQr } = await import(/* @vite-ignore */ modulePath);
      return (await createBrandedQr(url)) as string;
    },
    {
      modulePath: "/src/features/links/branded-qr.ts",
      url: expectedUrl,
    },
  );
  const decoded = await decodeImage(page, source, 1200);
  expect(decoded?.data).toBe(expectedUrl);
  expect((await decodeImage(page, source, 256))?.data).toBe(expectedUrl);
  await expectCenteredLogo(page, source, decoded!.version);
});
