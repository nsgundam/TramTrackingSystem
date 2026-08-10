import { expect, test, type BrowserContext, type Locator, type Page, type Route } from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";

const routes = [
  { id: "R01", name: "Campus Loop", color: "#075DC7", status: "active" },
];

const vehicles = [
  {
    id: "VH001",
    name: "Tram 01",
    type: "Tram",
    status: "active",
    assignedRouteId: "R01",
    route: routes[0],
  },
];

const stops = [
  {
    id: "ST01",
    nameTh: "ประตูหลัก",
    nameEn: "Main Gate",
    lat: 13.9641,
    lng: 100.5867,
    status: "active",
  },
  {
    id: "ST02",
    nameTh: "อาคารเรียน",
    nameEn: "Learning Center",
    lat: 13.9652,
    lng: 100.5878,
    status: "active",
  },
];

const authenticateAdmin = async (context: BrowserContext) => {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    userId: "t14-admin",
    username: "admin",
  })).toString("base64url");
  await context.addCookies([{
    name: "admin_token",
    value: `header.${payload}.signature`,
    url: ADMIN_ORIGIN,
  }]);
};

const fulfillJson = async (route: Route, body: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
};

const useMasterData = async (
  page: Page,
  options: {
    vehiclesResponse?: () => { status: number; body: unknown };
    onRouteStopsPut?: (body: unknown) => void;
  } = {},
) => {
  await page.route("**/api/admin/vehicles", async (route) => {
    const response = options.vehiclesResponse?.() ?? { status: 200, body: vehicles };
    await fulfillJson(route, response.body, response.status);
  });
  await page.route("**/api/admin/routes", (route) => fulfillJson(route, routes));
  await page.route("**/api/admin/stops", (route) => fulfillJson(route, stops));
  await page.route("**/api/admin/route-stops/R01", async (route) => {
    if (route.request().method() === "PUT") {
      options.onRouteStopsPut?.(route.request().postDataJSON());
      await fulfillJson(route, { success: true });
      return;
    }
    await fulfillJson(route, stops.map((stop, index) => ({ ...stop, stopOrder: index + 1 })));
  });
};

const expectMinimumTarget = async (locator: Locator) => {
  const boxes = await locator.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(boxes.length).toBeGreaterThan(0);
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
};

test("T14 Admin master-data pages share the semantic desktop hierarchy and named actions", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  await useMasterData(page);

  const pages = [
    { path: "/admin/vehicles", resource: "vehicles", heading: "Vehicles Management" },
    { path: "/admin/routes", resource: "routes", heading: "Routes Management" },
    { path: "/admin/stops", resource: "stops", heading: "Stops Management" },
  ] as const;

  for (const expected of pages) {
    await page.goto(expected.path);
    const resourcePage = page.locator(`[data-admin-resource="${expected.resource}"]`);
    await expect(resourcePage).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: expected.heading })).toBeVisible();
    await expect(resourcePage.locator('[data-admin-view="table"]')).toBeVisible();
    await expect(resourcePage.locator('[data-admin-view="cards"]')).toBeHidden();

    const presentation = await resourcePage.locator("[data-admin-resource-panel]").evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundImage: styles.backgroundImage,
        backdropFilter: styles.backdropFilter,
        transform: styles.transform,
      };
    });
    expect(presentation).toEqual({
      backgroundImage: "none",
      backdropFilter: "none",
      transform: "none",
    });
    await expectMinimumTarget(resourcePage.locator("[data-admin-resource-action]:visible"));
  }

  await expect(page.getByRole("button", { name: "Edit Main Gate" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Main Gate" })).toBeVisible();
});

test("T14 Admin vehicle load failure is inline, distinct from empty, and retryable", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  let shouldFail = true;
  await useMasterData(page, {
    vehiclesResponse: () => shouldFail
      ? { status: 503, body: { error: "Temporarily unavailable" } }
      : { status: 200, body: vehicles },
  });
  page.on("dialog", (dialog) => dialog.dismiss());

  await page.goto("/admin/vehicles");
  const resourceAlert = page.locator(".admin-resource-state--error");
  await expect(resourceAlert).toContainText("Unable to load vehicles");
  await expect(page.getByText("No vehicles found.")).toBeHidden();

  shouldFail = false;
  await page.getByRole("button", { name: "Retry loading vehicles" }).click();
  await expect(
    page.locator('[data-admin-view="table"]').getByText("Tram 01", { exact: true }),
  ).toBeVisible();
  await expect(resourceAlert).toBeHidden();
});

test("T14 Admin Mobile cards and CRUD dialog keep data, focus, and 44 px controls", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await useMasterData(page);

  await page.goto("/admin/routes");
  const resourcePage = page.locator('[data-admin-resource="routes"]');
  await expect(resourcePage.locator('[data-admin-view="cards"]')).toBeVisible();
  await expect(resourcePage.locator('[data-admin-view="table"]')).toBeHidden();
  await expect(resourcePage).toContainText("Campus Loop");
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);

  const editButton = page.getByRole("button", { name: "Edit Campus Loop" });
  await expectMinimumTarget(editButton);
  await editButton.click();
  const dialog = page.locator('[data-admin-dialog="form"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Edit Route" })).toBeVisible();
  await expect(dialog.getByLabel("Route Name")).toHaveValue("Campus Loop");
  await expect(dialog.getByRole("button", { name: "Close route dialog" })).toBeFocused();

  const dialogPresentation = await dialog.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      backdropFilter: styles.backdropFilter,
      transform: styles.transform,
    };
  });
  expect(dialogPresentation).toMatchObject({
    backgroundImage: "none",
    transform: "none",
  });
  expect(dialogPresentation.backdropFilter).toContain("blur(");
  await expectMinimumTarget(dialog.locator("[data-admin-control]:visible"));

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(editButton).toBeFocused();
});

test("T14 route-stop ordering keeps its ordered payload inside the shared Admin dialog", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  let publishedBody: unknown = null;
  await useMasterData(page, {
    onRouteStopsPut: (body) => {
      publishedBody = body;
    },
  });

  await page.goto("/admin/routes");
  await page.getByRole("button", { name: "Manage stops for Campus Loop" }).click();
  const dialog = page.locator('[data-admin-dialog="route-stops"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Published stop order").getByRole("listitem")).toHaveCount(2);
  await expectMinimumTarget(dialog.locator("[data-admin-control]:visible"));
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);

  await dialog.getByRole("button", { name: "Move ประตูหลัก down" }).click();
  await dialog.getByRole("button", { name: "Publish order" }).click();
  await expect.poll(() => publishedBody).toEqual({ stopIds: ["ST02", "ST01"] });
  await expect(dialog).toBeHidden();
});
