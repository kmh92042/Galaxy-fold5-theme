import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
function pngSize(buffer: Buffer) {
  expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}
test("all surfaces, actual PNG sizes, icon export, complete ZIP and guide", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const [label, size, name] of [
    ["외부 화면", [904, 2316], "cover"],
    ["내부 화면", [1812, 2176], "inner"],
    ["잠금화면", [904, 2316], "lock"],
  ] as const) {
    await page.getByRole("button", { name: label, exact: true }).click();
    const pending = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "배경화면 다운로드", exact: true })
      .click();
    const file = await pending;
    const bytes = await readFile((await file.path())!);
    expect(pngSize(bytes)).toEqual(size);
    expect(file.suggestedFilename()).toContain(name);
  }
  await page.getByRole("button", { name: "앱 아이콘", exact: true }).click();
  const iconPending = page.waitForEvent("download");
  await page.getByTitle("전화 PNG 다운로드").click();
  expect(pngSize(await readFile((await (await iconPending).path())!))).toEqual([
    192, 192,
  ]);
  const zipPending = page.waitForEvent("download");
  await page.getByRole("button", { name: "테마 팩 다운로드" }).click();
  const zipDownload = await zipPending;
  const zip = await JSZip.loadAsync(
    await readFile((await zipDownload.path())!),
  );
  const files = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  expect(files).toHaveLength(12);
  expect(
    pngSize(
      await zip.file("wallpapers/inner-1812x2176.png")!.async("nodebuffer"),
    ),
  ).toEqual([1812, 2176]);
  expect(
    pngSize(await zip.file("icons/kakao-192.png")!.async("nodebuffer")),
  ).toEqual([192, 192]);
  await page.getByRole("button", { name: "내 폰에 적용하는 방법" }).click();
  await expect(page.getByRole("dialog")).toContainText("자동 설치되는");
  await page.getByRole("button", { name: "확인했어요" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("image replacement is per surface; cropping, dimming and mobile layout work", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  const before = await page.locator(".device-image").getAttribute("style");
  await page
    .locator("input[type=file]")
    .setInputFiles("public/art/nocturne.png");
  await expect(page.getByRole("status")).toContainText("이미지를 교체");
  expect(await page.locator(".device-image").getAttribute("style")).not.toBe(
    before,
  );
  await page.getByRole("button", { name: "내부 화면", exact: true }).click();
  expect(await page.locator(".device-image").getAttribute("style")).toBe(
    before,
  );
  await page.locator("#dim").fill("45");
  await expect(page.locator(".device-dim")).toHaveAttribute(
    "style",
    "opacity: 0.45;",
  );
  await page.locator("#position").fill("80");
  await expect(page.locator(".device-image")).toHaveAttribute("style", /80%/);
  await page.getByRole("button", { name: /위젯 표시/ }).click();
  await expect(page.locator(".phone-clock")).toHaveCount(0);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});

test("collection selection preserves edits and produces distinct themed icon packs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Wings of Dawn/ }),
  ).toBeVisible();
  const downloadRelic = page.waitForEvent("download");
  await page.getByRole("button", { name: "앱 아이콘", exact: true }).click();
  await page.getByTitle("전화 PNG 다운로드").click();
  const relic = await readFile((await (await downloadRelic).path())!);
  await page.getByRole("button", { name: "배경화면", exact: true }).click();
  await page.locator("#dim").fill("37");
  await page.getByRole("button", { name: "NOCTURNE · 미드나잇" }).click();
  await expect(
    page.getByRole("heading", { name: /Midnight Awakening/ }),
  ).toBeVisible();
  await expect(page.locator("#dim")).toHaveValue("16");
  await page.getByRole("button", { name: "앱 아이콘", exact: true }).click();
  const downloadNeon = page.waitForEvent("download");
  await page.getByTitle("전화 PNG 다운로드").click();
  const neon = await readFile((await (await downloadNeon).path())!);
  expect(relic.equals(neon)).toBe(false);
  await page.getByRole("button", { name: "로스트아크 · 니나브" }).click();
  await page.getByRole("button", { name: "배경화면", exact: true }).click();
  await expect(page.locator("#dim")).toHaveValue("37");
  await expect(
    page.getByRole("link", { name: "기본 ZIP 바로 받기" }),
  ).toHaveAttribute("href", /LOSTARK-Nineveh-Fold5.zip$/);
});
