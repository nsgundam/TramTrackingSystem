import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";
const DIRECTION_SEED = "7c756d3a";
const DIRECTION_BLOCKS = [
  "THESIS:",
  "OWN-WORLD:",
  "STORY:",
  "FIRST VIEWPORT:",
  "FORM:",
  "FINISH:",
] as const;

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

const hideDevelopmentIndicator = async (page: Page) => {
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
};

const getDirectionContract = async (root: ReturnType<Page["locator"]>) => {
  const contract = root.locator(":scope > template[data-admin-design-contract]");
  await expect(contract).toHaveCount(1);
  return contract.evaluate((element) => {
    if (!(element instanceof HTMLTemplateElement)) return "";
    return element.content.textContent ?? "";
  });
};

const readMaterial = async (locator: ReturnType<Page["locator"]>) => locator.evaluate((element) => {
  const styles = getComputedStyle(element);
  return {
    backdropFilter: styles.backdropFilter,
    backgroundColor: styles.backgroundColor,
    borderRadius: styles.borderRadius,
  };
});

const parseCssColor = (value: string): [number, number, number] => {
  const shortHex = value.trim().match(/^#([\da-f]{3})$/i);
  if (shortHex) {
    return shortHex[1].split("").map((channel) => Number.parseInt(`${channel}${channel}`, 16)) as [number, number, number];
  }

  const hex = value.trim().match(/^#([\da-f]{6})$/i);
  if (hex) {
    return [0, 2, 4].map((offset) => Number.parseInt(hex[1].slice(offset, offset + 2), 16)) as [number, number, number];
  }

  const rgb = value.trim().match(/^rgba?\(\s*([\d.]+)[, ]+\s*([\d.]+)[, ]+\s*([\d.]+)/i);
  if (!rgb) throw new Error(`Unsupported CSS color: ${value}`);
  return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
};

const relativeLuminance = (value: string): number => {
  const [red, green, blue] = parseCssColor(value).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
};

const contrastRatio = (foreground: string, background: string): number => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};

test("T14 Signal Lens desktop separates glass chrome from stable operational content", async ({ page, context }, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  await blockExternalMapRequests(page);
  await useReadyDashboardData(page);

  await page.goto("/admin/dashboard");
  const shell = page.locator('[data-admin-theme="signal-lens"]');
  await expect(shell).toBeVisible();

  const contract = await getDirectionContract(shell);
  for (const block of DIRECTION_BLOCKS) expect(contract).toContain(block);
  expect(contract).toContain(DIRECTION_SEED);

  const [sidebarMaterial, statusMaterial, contentMaterial, mapMaterial] = await Promise.all([
    readMaterial(page.locator(".admin-sidebar")),
    readMaterial(page.getByTestId("admin-dashboard-status")),
    readMaterial(page.getByTestId("admin-map-workspace")),
    readMaterial(page.getByTestId("admin-live-map")),
  ]);

  expect(sidebarMaterial.backdropFilter).toContain("blur(");
  expect(statusMaterial.backdropFilter).toContain("blur(");
  expect(contentMaterial.backdropFilter).toBe("none");
  expect(mapMaterial.backdropFilter).toBe("none");
  expect(contentMaterial.backgroundColor).toMatch(/^rgb\(/);
  expect(sidebarMaterial.borderRadius).not.toBe("0px");

  const identityMaterial = await readMaterial(page.locator(".admin-sidebar__mark"));
  expect(identityMaterial.backgroundColor).toBe("rgb(44, 44, 46)");
  const categoryIcons = await page.locator(".admin-metric__icon").evaluateAll((elements) => (
    elements.map((element) => {
      const styles = getComputedStyle(element);
      return { backgroundColor: styles.backgroundColor, color: styles.color };
    })
  ));
  expect(categoryIcons).toHaveLength(3);
  for (const icon of categoryIcons) {
    expect(icon).toEqual({
      backgroundColor: "rgb(242, 242, 247)",
      color: "rgb(58, 58, 60)",
    });
  }

  const contrastTokens = await shell.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      ink: styles.getPropertyValue("--admin-ink").trim(),
      muted: styles.getPropertyValue("--admin-muted").trim(),
      content: styles.getPropertyValue("--admin-content").trim(),
    };
  });
  expect(contrastRatio(contrastTokens.ink, contrastTokens.content)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(contrastTokens.muted, contrastTokens.content)).toBeGreaterThanOrEqual(4.5);

  await expect(page.getByRole("heading", { level: 1, name: "Live operations" })).toBeVisible();
  await expect(page.getByTestId("admin-stat-vehicles")).toHaveText("1");
  await hideDevelopmentIndicator(page);
  await page.screenshot({
    path: testInfo.outputPath("admin-dashboard-desktop.png"),
    fullPage: true,
  });
});

test("T14 Signal Lens Mobile chrome remains operable, bounded, and focus-safe", async ({ page, context }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await blockExternalMapRequests(page);
  await useReadyDashboardData(page);

  await page.goto("/admin/dashboard");
  const shell = page.locator('[data-admin-theme="signal-lens"]');
  await expect(shell).toBeVisible();

  const headerMaterial = await readMaterial(page.locator(".admin-mobile-header"));
  expect(headerMaterial.backdropFilter).toContain("blur(");

  const menuButton = page.getByRole("button", { name: "Open sidebar" });
  const menuBox = await menuButton.boundingBox();
  expect(menuBox).not.toBeNull();
  expect(menuBox!.width).toBeGreaterThanOrEqual(44);
  expect(menuBox!.height).toBeGreaterThanOrEqual(44);

  await menuButton.click();
  const drawer = page.getByRole("dialog", { name: "Admin navigation" });
  await expect(drawer.getByRole("button", { name: "Close sidebar" })).toBeFocused();
  expect((await readMaterial(drawer)).backdropFilter).toContain("blur(");
  await page.waitForTimeout(250);
  await hideDevelopmentIndicator(page);
  await page.screenshot({
    path: testInfo.outputPath("admin-dashboard-mobile.png"),
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(menuButton).toBeFocused();

  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
});

test("T14 Admin Login shares Signal Lens and preserves the exact safe request flow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let loginRequests = 0;
  let loginPayload: unknown;
  let releaseResponse: (() => void) | undefined;
  const responseGate = new Promise<void>((resolve) => {
    releaseResponse = resolve;
  });

  await page.route("**/api/auth/login", async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ADMIN_ORIGIN,
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
      });
      return;
    }

    loginRequests += 1;
    loginPayload = route.request().postDataJSON();
    await responseGate;
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": ADMIN_ORIGIN },
      body: JSON.stringify({ error: "Invalid admin credentials" }),
    });
  });

  await page.goto("/admin/login");
  const loginRoot = page.locator('main[data-admin-theme="signal-lens"]');
  await expect(loginRoot).toBeVisible();
  const contract = await getDirectionContract(loginRoot);
  expect(contract).toContain(DIRECTION_SEED);

  const panel = page.locator(".admin-login__panel");
  expect((await readMaterial(panel)).backdropFilter).toContain("blur(");
  expect((await readMaterial(page.locator(".admin-login__mark"))).backgroundColor).toBe("rgb(44, 44, 46)");
  await expect(page.getByLabel("Username")).toHaveAttribute("autocomplete", "username");
  await expect(page.getByLabel("Password")).toHaveAttribute("autocomplete", "current-password");

  const username = page.getByLabel("Username");
  await username.focus();
  const focusIndicator = await username.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      color: styles.outlineColor,
      style: styles.outlineStyle,
      width: styles.outlineWidth,
    };
  });
  expect(focusIndicator).toEqual({
    color: "rgb(7, 93, 199)",
    style: "solid",
    width: "2px",
  });
  await username.fill("admin.operator");
  const password = page.getByLabel("Password");
  await password.fill("not-a-real-secret");
  const submit = page.locator(".admin-login__submit");
  await expect(submit).toHaveAccessibleName("Sign In");
  expect((await readMaterial(submit)).backdropFilter).toBe("none");
  await submit.click();
  await expect.poll(() => loginRequests).toBe(1);
  await expect(submit).toBeDisabled();
  await page.waitForTimeout(100);
  expect(loginRequests).toBe(1);
  expect(loginPayload).toEqual({
    username: "admin.operator",
    password: "not-a-real-secret",
  });

  releaseResponse?.();
  await expect(page.locator(".admin-login__alert")).toHaveText("Invalid admin credentials");
  await expect(submit).toBeEnabled();
  await hideDevelopmentIndicator(page);
  await page.screenshot({
    path: testInfo.outputPath("admin-login-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({
    path: testInfo.outputPath("admin-login-desktop.png"),
    fullPage: true,
  });

  const loginSource = await readFile(path.join(process.cwd(), "app/admin/login/page.tsx"), "utf8");
  expect(loginSource).not.toMatch(/backdrop-blur|bg-linear|hover:scale/);
});

test("T14 protected Admin rejection keeps the incumbent Login redirect", async ({ page, context }) => {
  await authenticateAdmin(context);
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": ADMIN_ORIGIN },
      body: JSON.stringify({ error: "Session expired" }),
    });
  });

  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.locator('main[data-admin-theme="signal-lens"]')).toBeVisible();
});

test("T14 Signal Lens stays bright and supports accessibility fallback contexts", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ colorScheme: "dark" });
  await authenticateAdmin(context);
  await blockExternalMapRequests(page);
  await useReadyDashboardData(page);

  await page.goto("/admin/dashboard");
  const shell = page.locator('[data-admin-theme="signal-lens"]');
  await expect(shell).toBeVisible();
  const lightTokens = await shell.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      scheme: styles.colorScheme,
      ink: styles.getPropertyValue("--admin-ink").trim(),
      muted: styles.getPropertyValue("--admin-muted").trim(),
      content: styles.getPropertyValue("--admin-content").trim(),
    };
  });
  expect(lightTokens.scheme).toContain("light");
  expect(["#fff", "#ffffff"]).toContain(lightTokens.content);
  expect(contrastRatio(lightTokens.ink, lightTokens.content)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(lightTokens.muted, lightTokens.content)).toBeGreaterThanOrEqual(4.5);

  await page.emulateMedia({ colorScheme: "dark", forcedColors: "active" });
  expect((await readMaterial(page.locator(".admin-sidebar"))).backdropFilter).toBe("none");

  const stylesheet = await readFile(path.join(process.cwd(), "app/admin/admin.css"), "utf8");
  expect(stylesheet).toMatch(/prefers-reduced-transparency:\s*reduce/);
  expect(stylesheet).toMatch(/prefers-contrast:\s*more/);
  expect(stylesheet).toMatch(/forced-colors:\s*active/);
  expect(stylesheet).toMatch(/prefers-reduced-motion:\s*reduce/);
  expect(stylesheet).toMatch(/@supports\s+not\s+\(\s*backdrop-filter:/);
});
