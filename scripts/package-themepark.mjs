// Run export-full-theme.mjs first. Creates a smaller on-device manual application pack.
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 480, height: 900 },
    deviceScaleFactor: 2,
  });
  await page.setContent(
    await readFile(
      "design/full-theme/exports/ThemePark-색상입력표.html",
      "utf8",
    ),
  );
  await page.screenshot({
    path: "design/full-theme/color-input-sheet.png",
    fullPage: true,
  });
} finally {
  await browser.close();
}
const original = await JSZip.loadAsync(
  await readFile("public/downloads/LOSTARK-Nineveh-Fold5-Design-Kit.zip"),
);
const manual = new JSZip();
for (const [name, entry] of Object.entries(original.files)) {
  if (entry.dir) continue;
  if (
    name.startsWith("device-resources/") ||
    [
      "palette.json",
      "ThemePark-색상입력표.html",
      "조립-및-적용-안내.md",
    ].includes(name)
  )
    manual.file(name, await entry.async("uint8array"));
}
manual.file(
  "색상입력표.png",
  await readFile("design/full-theme/color-input-sheet.png"),
);
const bytes = await manual.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE",
  compressionOptions: { level: 6 },
});
await writeFile("public/downloads/LOSTARK-Nineveh-ThemePark-Manual.zip", bytes);
console.log(`Manual application pack: ${bytes.length} bytes, 15 files.`);
