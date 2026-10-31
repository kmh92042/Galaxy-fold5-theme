// First start: npm run dev -- --port 5173
// Then: node scripts/export-assets.mjs lostark (or nocturne)
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import JSZip from "jszip";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const id = process.argv[2] || "lostark";
if (!["lostark", "nocturne"].includes(id))
  throw new Error("Collection must be lostark or nocturne");
const directory = id === "lostark" ? "design/lostark" : "design";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
  });
  await page.goto("http://127.0.0.1:5173");
  if (id === "nocturne")
    await page.getByRole("button", { name: "NOCTURNE · 미드나잇" }).click();
  await page.locator(".device-image").evaluate(async (element) => {
    const url = getComputedStyle(element).backgroundImage.slice(5, -2);
    const image = new Image();
    image.src = url;
    await image.decode();
  });
  await mkdir(directory, { recursive: true });
  await page.screenshot({ path: `${directory}/preview.png`, fullPage: true });
  const ready = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "테마 팩 다운로드", exact: true })
    .click();
  const file = await ready;
  const bytes = await readFile(await file.path());
  const zip = await JSZip.loadAsync(bytes);
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const target = `${directory}/exports/${name}`;
    await mkdir(target.slice(0, target.lastIndexOf("/")), { recursive: true });
    await writeFile(target, await entry.async("nodebuffer"));
  }
  await mkdir("public/downloads", { recursive: true });
  await writeFile(`public/downloads/${file.suggestedFilename()}`, bytes);
  console.log(
    `Exported ${id}: 3 wallpapers, 8 icons, guide, preview and ${file.suggestedFilename()}`,
  );
} finally {
  await browser.close();
}
