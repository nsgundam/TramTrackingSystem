import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";

const relativeLuminance = (hex: string): number => {
  const normalized = hex.length === 4
    ? hex.slice(1).split("").map((digit) => `${digit}${digit}`).join("")
    : hex.slice(1);
  const [red, green, blue] = normalized.match(/.{2}/g)!.map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
};

const contrastRatio = (foreground: string, background: string): number => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};

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

const blockExternalMapRequests = async (page: Page) => {
  await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("https://cdn-icons-png.flaticon.com/**", (route) => route.abort());
};

const useReadyDashboardData = async (page: Page) => {
  const response = await page.request.get(
    "http://127.0.0.1:13001/t14/admin-stats-mode?mode=ready",
  );
  expect(response.ok()).toBe(true);
};

test("T14 Admin Dashboard prioritizes canonical state over configured inventory", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  await blockExternalMapRequests(page);
  await useReadyDashboardData(page);

  await page.goto("/admin/dashboard");
  const shell = page.locator('[data-admin-theme="rsu-operations"]');
  await expect(shell).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Live operations" })).toBeVisible();

  const themeTokens = await shell.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      canvas: styles.getPropertyValue("--admin-canvas").trim(),
      surface: styles.getPropertyValue("--admin-surface").trim(),
      ink: styles.getPropertyValue("--admin-ink").trim(),
      muted: styles.getPropertyValue("--admin-muted").trim(),
      primary: styles.getPropertyValue("--admin-primary").trim(),
      focus: styles.getPropertyValue("--admin-focus").trim(),
    };
  });
  expect(themeTokens).toMatchObject({
    canvas: "#f3f6fa",
    ink: "#142033",
    muted: "#526176",
    primary: "#075dc7",
    focus: "#2563eb",
  });
  expect(["#fff", "#ffffff"]).toContain(themeTokens.surface);
  expect(contrastRatio(themeTokens.ink, themeTokens.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(themeTokens.muted, themeTokens.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(themeTokens.primary, themeTokens.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(themeTokens.focus, themeTokens.surface)).toBeGreaterThanOrEqual(3);

  const mapWorkspace = page.getByTestId("admin-map-workspace");
  const inventory = page.getByTestId("admin-configured-inventory");
  await expect(mapWorkspace).toBeVisible();
  await expect(inventory).toBeVisible();
  const mapPrecedesInventory = await mapWorkspace.evaluate((map, inventoryElement) => (
    Boolean(map.compareDocumentPosition(inventoryElement) & Node.DOCUMENT_POSITION_FOLLOWING)
  ), await inventory.elementHandle());
  expect(mapPrecedesInventory).toBe(true);

  const mapBox = await mapWorkspace.boundingBox();
  const inventoryBox = await inventory.boundingBox();
  expect(mapBox).not.toBeNull();
  expect(inventoryBox).not.toBeNull();
  expect(mapBox!.width).toBeGreaterThan(inventoryBox!.width);

  const panelPresentation = await mapWorkspace.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      backdropFilter: styles.backdropFilter,
      transform: styles.transform,
    };
  });
  expect(panelPresentation).toEqual({
    backgroundImage: "none",
    backdropFilter: "none",
    transform: "none",
  });

  await expect(page.getByTestId("admin-stat-vehicles")).toHaveText("1");
  await expect(page.getByTestId("admin-stat-routes")).toHaveText("2");
  await expect(page.getByTestId("admin-stat-stops")).toHaveText("4");
  await expect(inventory).toContainText("Configured service inventory");
  await expect(inventory).toContainText("Live telemetry state appears on the map");

  await expect(page.getByRole("link", { name: "Open source health" })).toHaveAttribute(
    "href",
    "/admin/devices",
  );
  await expect(page.getByRole("link", { name: "Manage vehicles" })).toHaveAttribute(
    "href",
    "/admin/vehicles",
  );
  await expect(page.getByTestId("admin-dashboard-content")).not.toContainText(/exception|research/i);
});

test("T14 Admin Dashboard stays ordered and operable at the Mobile shell breakpoint", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await blockExternalMapRequests(page);
  await useReadyDashboardData(page);

  await page.goto("/admin/dashboard");
  await expect(page.locator('[data-admin-theme="rsu-operations"]')).toBeVisible();
  await expect(page.getByTestId("admin-dashboard-status")).toContainText("Updated");

  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);

  const mapWorkspace = page.getByTestId("admin-map-workspace");
  const inventory = page.getByTestId("admin-configured-inventory");
  const mapBox = await mapWorkspace.boundingBox();
  const inventoryBox = await inventory.boundingBox();
  expect(mapBox).not.toBeNull();
  expect(inventoryBox).not.toBeNull();
  expect(mapBox!.y).toBeLessThan(inventoryBox!.y);

  const mapCanvas = page.getByTestId("admin-live-map");
  const statusSurface = page.getByTestId("admin-map-status-surface");
  const zoomControls = page.locator(".leaflet-top.leaflet-left");
  const [canvasBox, statusBox, controlsBox] = await Promise.all([
    mapCanvas.boundingBox(),
    statusSurface.boundingBox(),
    zoomControls.boundingBox(),
  ]);
  expect(canvasBox).not.toBeNull();
  expect(statusBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();
  expect(statusBox!.x).toBeGreaterThanOrEqual(canvasBox!.x);
  expect(statusBox!.x + statusBox!.width).toBeLessThanOrEqual(canvasBox!.x + canvasBox!.width);
  expect(statusBox!.y).toBeGreaterThanOrEqual(canvasBox!.y);
  expect(statusBox!.y + statusBox!.height).toBeLessThanOrEqual(canvasBox!.y + canvasBox!.height);
  const overlapsZoomControls = !(
    statusBox!.x >= controlsBox!.x + controlsBox!.width
    || statusBox!.x + statusBox!.width <= controlsBox!.x
    || statusBox!.y >= controlsBox!.y + controlsBox!.height
    || statusBox!.y + statusBox!.height <= controlsBox!.y
  );
  expect(overlapsZoomControls).toBe(false);

  const menuButton = page.getByRole("button", { name: "Open sidebar" });
  const sidebar = page.locator("#admin-sidebar");
  await expect(sidebar).toHaveAttribute("inert", "");
  await menuButton.click();
  const drawer = page.getByRole("dialog", { name: "Admin navigation" });
  await expect(drawer.getByRole("button", { name: "Close sidebar" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(sidebar).toHaveAttribute("inert", "");
  await expect(menuButton).toBeFocused();
});
