// Start npm run dev -- --port 5173 first; then node scripts/export-full-theme.mjs
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1050 },
  });
  await page.goto("http://127.0.0.1:5173");
  await page
    .getByRole("button", { name: "전체 테마 설계 보기", exact: true })
    .click();
  await page.getByRole("button", { name: "제작자료 ZIP 다운로드" }).waitFor();
  const ready = page.waitForEvent("download", { timeout: 120000 });
  await page.getByRole("button", { name: "제작자료 ZIP 다운로드" }).click();
  const file = await ready;
  const bytes = await readFile(await file.path());
  const zip = await JSZip.loadAsync(bytes);
  await mkdir("design/full-theme/exports", { recursive: true });
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const path = `design/full-theme/exports/${name}`;
    await mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
    await writeFile(path, await entry.async("nodebuffer"));
  }
  await mkdir("public/downloads", { recursive: true });
  await writeFile(`public/downloads/${file.suggestedFilename()}`, bytes);
  await page
    .locator(".system-screen-frame > img")
    .evaluateAll(async (images) => {
      await Promise.all(
        images.map(async (image) => {
          image.loading = "eager";
          await image.decode();
        }),
      );
    });
  // Screenshot only the design board; no browser or real-device screenshot claim.
  await page
    .locator(".full-theme-studio")
    .screenshot({ path: "design/full-theme/design-board.png", timeout: 60000 });
  await page.setViewportSize({ width: 2600, height: 1250 });
  await page.locator(".full-theme-studio").evaluate((el) => {
    el.style.width = "2400px";
  });
  await page.locator(".system-screen-grid").evaluate((el) => {
    el.style.gridTemplateColumns = "repeat(7,minmax(0,1fr))";
  });
  await page
    .locator(".system-screen-grid")
    .screenshot({ path: "design/full-theme/screen-lineup.png" });
  console.log(
    `Saved ${file.suggestedFilename()} (${bytes.length} bytes), ${Object.values(zip.files).filter((x) => !x.dir).length} files and design-board.png`,
  );
} finally {
  await browser.close();
}
