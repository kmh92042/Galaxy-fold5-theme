import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import JSZip from "jszip";
test("system concepts are labelled and the kit contains real editable assets, not an installer", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "전체 테마 설계 보기", exact: true })
    .click();
  const panel = page.locator(".full-theme-studio");
  await expect(panel).toContainText("디자인 시안");
  await expect(panel).toContainText("기기 적용 전");
  await expect(panel.locator(".system-screen-frame > img")).toHaveCount(7);
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "제작자료 ZIP 다운로드", exact: true })
    .click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("LOSTARK-Nineveh-Fold5-Design-Kit.zip");
  const zip = await JSZip.loadAsync(await readFile((await file.path())!));
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  expect(names).toHaveLength(47);
  expect(names.some((n) => /\.(apk|mtpk)$/i.test(n))).toBe(false);
  const metadata = JSON.parse(await zip.file("palette.json")!.async("string"));
  expect(metadata.targetOneUi).toBe("8.5");
  expect(metadata.reportedTabs).toHaveLength(5);
  expect(
    await zip.file("ThemePark-색상입력표.html")!.async("string"),
  ).toContain("음량패널");
  expect(metadata.installable).toBe(false);
  expect(metadata.themeParkImport).toBe(false);
  expect(metadata.deviceValidated).toBe(false);
  for (const name of [
    "home",
    "lock",
    "dialer",
    "messages",
    "keyboard",
    "quickpanel",
    "volume",
  ]) {
    const png = await zip
      .file(`design-previews/${name}.png`)!
      .async("nodebuffer");
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([904, 2316]);
    expect(png.length).toBeGreaterThan(30000);
    const svg = await zip.file(`design-previews/${name}.svg`)!.async("string");
    expect(svg).toContain("../source-art.png");
  }
  const guide = await zip.file("조립-및-적용-안내.md")!.async("string");
  expect(guide).toContain("JSON을 Theme Park에 가져와 적용할 수 없습니다.");
  expect(guide).toContain("실제 적용");
  expect(
    await zip.file("assembly-assets/key-action.svg")!.async("string"),
  ).toContain(metadata.colors.accent);
  expect(errors).toEqual([]);
});
test("design board fits a mobile viewport without hiding scope labels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "전체 테마 설계 보기" }).click();
  await expect(page.locator(".full-theme-status")).toContainText(
    "설치 파일이나",
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
