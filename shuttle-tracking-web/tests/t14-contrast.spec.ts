import { expect, test, type BrowserContext, type Locator, type Page } from "@playwright/test";

const APP_ORIGIN = "http://127.0.0.1:13000";

test.use({ serviceWorkers: "block" });

type Rgb = readonly [red: number, green: number, blue: number];

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

const blockExternalMapRequests = async (page: Page) => {
  await page.route("https://router.project-osrm.org/**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        code: "Ok",
        routes: [{ geometry: { coordinates: [[100.58, 13.98], [100.581, 13.981]] } }],
      }),
    });
  });
  await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("https://cdn-icons-png.flaticon.com/**", (route) => route.abort());
};

const luminance = ([red, green, blue]: Rgb) => {
  const linear = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

const ratio = (foreground: Rgb, background: Rgb) => {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};

const computedRgb = async (locator: Locator, property: "color" | "backgroundColor"): Promise<Rgb> => (
  locator.evaluate((element, propertyName) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas color conversion is unavailable");
    context.fillStyle = getComputedStyle(element)[propertyName];
    context.fillRect(0, 0, 1, 1);
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
    return [red, green, blue] as const;
  }, property)
);

const computedContrast = async (foreground: Locator, background: Locator) => {
  const foregroundColor = await computedRgb(foreground, "color");
  const backgroundColor = await computedRgb(background, "backgroundColor");
  return ratio(foregroundColor, backgroundColor);
};

test("T14 Public Feedback foregrounds meet their scoped contrast budgets", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await context.grantPermissions(["geolocation"], { origin: APP_ORIGIN });
  await context.setGeolocation({ latitude: 13.98, longitude: 100.58 });
  await page.addInitScript(() => localStorage.setItem("rsu-bus-tour-seen", "true"));
  await blockExternalMapRequests(page);

  await page.goto("/");
  await expect(page.getByRole("button", { name: /Route 01/ })).toBeVisible();
  await page.getByRole("button", { name: "ส่งข้อเสนอแนะ" }).click();

  const dialog = page.getByRole("dialog", { name: "ส่งข้อเสนอแนะ / แจ้งปัญหา" });
  const textTargets = [
    dialog.getByText("ประเภทการติดต่อ", { exact: true }),
    dialog.getByText("เลือกหมายเลขรถรถราง", { exact: true }),
    dialog.getByText("รายละเอียดข้อเสนอแนะ / ปัญหาที่พบ", { exact: true }),
  ];
  for (const target of textTargets) {
    expect(await computedContrast(target, dialog)).toBeGreaterThanOrEqual(4.5);
  }
  expect(
    await computedContrast(dialog.getByRole("button", { name: "ปิดหน้าต่างข้อเสนอแนะ" }), dialog),
  ).toBeGreaterThanOrEqual(3);
});

test("T14 Admin route badges preserve valid backgrounds and choose AA foregrounds", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  await page.route(/\/api\/admin\/vehicles$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        { id: "light", name: "Light Vehicle", type: "tram", status: "active", route: { id: "L", name: "Light Route", color: "#FDE047" } },
        { id: "dark", name: "Dark Vehicle", type: "tram", status: "active", route: { id: "D", name: "Dark Route", color: "#1E3A8A" } },
        { id: "invalid", name: "Fallback Vehicle", type: "tram", status: "active", route: { id: "F", name: "Fallback Route", color: "invalid" } },
      ]),
    });
  });

  await page.goto("/admin/vehicles");
  const badges = page.locator("[data-route-color-badge]");
  await expect(badges).toHaveCount(6);

  const expectedBackgrounds = new Set(["253,224,71", "30,58,138", "59,130,246"]);
  for (const badge of await badges.all()) {
    const foreground = await computedRgb(badge, "color");
    const background = await computedRgb(badge, "backgroundColor");
    expect(expectedBackgrounds.has(background.join(","))).toBe(true);
    expect(ratio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  }

  const visibleBadges = badges.filter({ visible: true });
  await expect(visibleBadges.getByText("Light Route")).toHaveCSS("color", "rgb(0, 0, 0)");
  await expect(visibleBadges.getByText("Dark Route")).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(visibleBadges.getByText("Fallback Route")).toHaveCSS("background-color", "rgb(59, 130, 246)");
});
