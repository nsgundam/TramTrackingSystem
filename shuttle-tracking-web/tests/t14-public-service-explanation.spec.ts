import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const APP_ORIGIN = "http://127.0.0.1:13000";
const MOCK_ORIGIN = "http://127.0.0.1:13001";

test.use({ serviceWorkers: "block" });

const preparePublicPage = async (
  page: Page,
  context: BrowserContext,
  viewport: { width: number; height: number },
) => {
  await page.setViewportSize(viewport);
  await context.grantPermissions(["geolocation"], { origin: APP_ORIGIN });
  await context.setGeolocation({ latitude: 13.98, longitude: 100.58 });
  await page.addInitScript(() => localStorage.setItem("rsu-bus-tour-seen", "true"));
  await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("https://cdn-icons-png.flaticon.com/**", (route) => route.abort());
  await page.route("https://router.project-osrm.org/**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: "Ok",
        routes: [{ geometry: { coordinates: [[100.58, 13.98], [100.581, 13.981]] } }],
      }),
    });
  });
};

const boundingBox = async (locator: ReturnType<Page["locator"]>) => {
  const value = await locator.boundingBox();
  expect(value).not.toBeNull();
  return value!;
};

const overlaps = (
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number },
) => left.x < right.x + right.width
  && left.x + left.width > right.x
  && left.y < right.y + right.height
  && left.y + left.height > right.y;

test("T14 Public snapshot failure explains uncertainty and recovers without changing overlay order", async ({ page, context }) => {
  await preparePublicPage(page, context, { width: 320, height: 568 });
  const armed = await page.request.get(`${MOCK_ORIGIN}/t14/fail-next-active-vehicles?count=2`);
  expect(armed.ok()).toBe(true);

  await page.goto("/");
  await expect(page.locator(".preloader-overlay")).toHaveCount(0, { timeout: 7_000 });

  const availability = page.getByTestId("availability-card");
  await expect(availability).toContainText("โหลดสถานะล่าสุดไม่สำเร็จ");
  await expect(availability).toContainText("ยังไม่มีสถานะรถที่ยืนยันได้");
  await expect(availability).not.toContainText(/ฐานข้อมูล|เซิร์ฟเวอร์|อุปกรณ์|สัญญาณอินเทอร์เน็ต/);

  const retry = availability.getByRole("button", { name: "ลองโหลดข้อมูลอีกครั้ง" });
  const retryBox = await boundingBox(retry);
  expect(retryBox.height).toBeGreaterThanOrEqual(44);

  const brandBox = await boundingBox(page.getByRole("heading", { name: "RSU" }).locator("..").locator(".."));
  const availabilityBox = await boundingBox(availability);
  expect(overlaps(brandBox, availabilityBox)).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);

  await page.getByTitle("Current Location").click();
  const stopCard = page.getByTestId("stop-info-card");
  await expect(stopCard).toContainText("ETA ยังไม่พร้อม");
  await expect(stopCard).not.toContainText("ยังไม่มีรถในสายนี้");
  expect(overlaps(
    await boundingBox(page.getByTestId("bottom-dock")),
    await boundingBox(page.getByTestId("map-controls")),
  )).toBe(false);

  const delayedRetry = await page.request.get(`${MOCK_ORIGIN}/t14/delay-next-active-vehicles?ms=350`);
  expect(delayedRetry.ok()).toBe(true);
  await retry.click();
  await expect(availability).toContainText("กำลังโหลดสถานะล่าสุด");
  await expect(availability).toContainText("Active Trams");
  await expect(availability).toContainText("อัปเดตล่าสุด");

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(overlaps(
    await boundingBox(page.getByRole("heading", { name: "RSU" }).locator("..").locator("..")),
    await boundingBox(availability),
  )).toBe(false);
});

test("T14 slow preloader explains its automatic fallback and releases the desktop map", async ({ page, context }) => {
  await preparePublicPage(page, context, { width: 1280, height: 900 });
  const delayed = await page.request.get(`${MOCK_ORIGIN}/t14/delay-next-active-vehicles?ms=6500&count=2`);
  expect(delayed.ok()).toBe(true);

  await page.goto("/");
  const preloader = page.locator(".preloader-overlay");
  await expect(preloader).toContainText("กำลังใช้เวลานานกว่าปกติ", { timeout: 4_500 });
  await expect(preloader).toContainText("ระบบจะเปิดแผนที่ให้อัตโนมัติ");
  await expect(preloader).toHaveCount(0, { timeout: 7_000 });
  await expect(page.getByTestId("availability-card")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1280);
});
