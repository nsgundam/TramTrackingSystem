import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const APP_ORIGIN = "http://127.0.0.1:13000";

test.use({ serviceWorkers: "block" });

const authenticateAdmin = async (context: BrowserContext) => {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    userId: "t14-admin",
    username: "admin",
  })).toString("base64url");
  await context.addCookies([{
    name: "admin_token",
    value: `header.${payload}.signature`,
    url: APP_ORIGIN,
  }]);
};

const preparePublicMap = async (page: Page, context: BrowserContext) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await context.grantPermissions(["geolocation"], { origin: APP_ORIGIN });
  await context.setGeolocation({ latitude: 13.98, longitude: 100.58 });
  await page.addInitScript(() => localStorage.setItem("rsu-bus-tour-seen", "true"));
  await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("https://cdn-icons-png.flaticon.com/**", (route) => route.abort());
};

const box = async (locator: ReturnType<Page["locator"]>) => {
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

test("T14 selected-route request budget and 320px controls are measured", async ({ page, context }) => {
  await preparePublicMap(page, context);
  const stopRequests: string[] = [];
  let geometryRequests = 0;

  page.on("request", (request) => {
    const match = new URL(request.url()).pathname.match(/\/api\/public\/routes\/(R0[12])\/stops$/);
    if (match?.[1]) stopRequests.push(match[1]);
  });
  await page.route("https://router.project-osrm.org/**", async (route) => {
    geometryRequests += 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: "Ok",
        routes: [{ geometry: { coordinates: [[100.58, 13.98], [100.581, 13.981]] } }],
      }),
    });
  });

  await page.goto("/");
  const defaultLoaderMotion = await page.locator(".loader").evaluate((element) =>
    getComputedStyle(element).animationIterationCount
  );
  expect(defaultLoaderMotion).toBe("infinite");
  await expect(page.locator(".preloader-overlay")).toHaveCount(0, { timeout: 4_500 });
  await expect.poll(() => stopRequests).toEqual(["R01"]);
  expect(geometryRequests).toBe(1);

  await page.getByRole("button", { name: /Route 01/ }).click();
  await page.getByRole("button", { name: "Route 02" }).click();
  await expect.poll(() => stopRequests).toEqual(["R01", "R02"]);
  await expect.poll(() => geometryRequests).toBe(2);

  await page.getByRole("button", { name: /Route 02/ }).click();
  await page.getByRole("button", { name: "Route 01" }).click();
  await page.getByRole("button", { name: /Route 01/ }).click();
  await page.getByRole("button", { name: "Route 02" }).click();
  await page.waitForTimeout(100);
  expect(stopRequests).toEqual(["R01", "R02"]);
  expect(geometryRequests).toBe(2);

  await page.getByTitle("Current Location").click();
  await expect(page.getByRole("heading", { name: "R02 Start" })).toBeVisible();

  const controls = page.locator('[data-testid="map-controls"]');
  const dock = page.locator('[data-testid="bottom-dock"]');
  const controlButtons = controls.getByRole("button");
  await expect(controlButtons).toHaveCount(3);
  for (const control of await controlButtons.all()) {
    const controlBox = await box(control);
    const visiblePanelBox = await box(control.locator("span").first());
    expect(controlBox.width).toBeGreaterThanOrEqual(44);
    expect(controlBox.height).toBeGreaterThanOrEqual(44);
    expect(visiblePanelBox.width).toBe(36);
    expect(visiblePanelBox.height).toBe(36);
  }
  const dockBox = await box(dock);
  expect(dockBox.width).toBeGreaterThanOrEqual(240);
  expect(overlaps(dockBox, await box(controls))).toBe(false);
});

test("T14 reduced-motion CSS and Admin route-order touch targets are measured", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await preparePublicMap(page, context);
  await page.route("https://router.project-osrm.org/**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: "Ok",
        routes: [{ geometry: { coordinates: [[100.58, 13.98], [100.581, 13.981]] } }],
      }),
    });
  });
  await page.goto("/");
  const reducedLoaderMotion = await page.locator(".loader").evaluate((element) => ({
    duration: getComputedStyle(element).animationDuration,
    iterations: getComputedStyle(element).animationIterationCount,
  }));
  expect(reducedLoaderMotion.iterations).toBe("1");
  expect(Number.parseFloat(reducedLoaderMotion.duration)).toBeLessThanOrEqual(0.001);

  await authenticateAdmin(context);
  await page.route(/\/api\/admin\/stops$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        { id: "r01-1", nameTh: "R01 Start", nameEn: "R01 Start", lat: 13.98, lng: 100.58, status: "active" },
        { id: "r01-2", nameTh: "R01 End", nameEn: "R01 End", lat: 13.981, lng: 100.581, status: "active" },
      ]),
    });
  });
  await page.route(/\/api\/admin\/route-stops\/R01$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        { id: "r01-1", nameTh: "R01 Start", nameEn: "R01 Start", lat: 13.98, lng: 100.58, stopOrder: 1 },
        { id: "r01-2", nameTh: "R01 End", nameEn: "R01 End", lat: 13.981, lng: 100.581, stopOrder: 2 },
      ]),
    });
  });
  await page.goto("/admin/routes");
  await page.getByRole("button", { name: "Manage stops for Route 01" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Route stops" });
  await expect(dialog.getByRole("button", { name: "Move R01 Start up" })).toBeVisible();

  for (const name of ["Move R01 Start up", "Move R01 Start down", "Remove R01 Start"]) {
    const controlBox = await box(dialog.getByRole("button", { name }));
    expect(controlBox.width).toBeGreaterThanOrEqual(44);
    expect(controlBox.height).toBeGreaterThanOrEqual(44);
  }
});
