import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";

const adminToken = (): string => {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    userId: "admin-entry-test",
    username: "admin",
  })).toString("base64url");
  return `header.${payload}.signature`;
};

const authenticateAdmin = async (context: BrowserContext): Promise<void> => {
  await context.addCookies([{
    name: "admin_token",
    value: adminToken(),
    url: ADMIN_ORIGIN,
  }]);
};

const blockExternalMapRequests = async (page: Page): Promise<void> => {
  await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("https://cdn-icons-png.flaticon.com/**", (route) => route.abort());
};

test("unauthenticated Admin entry remains protected", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { level: 1, name: "Admin Portal" })).toBeVisible();
});

test("authenticated Admin entry redirects to the canonical Dashboard", async ({ page, context }) => {
  await authenticateAdmin(context);
  await blockExternalMapRequests(page);

  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1, name: "Live operations" })).toBeVisible();
});

test("successful Admin Login lands on the canonical Dashboard", async ({ page }) => {
  await blockExternalMapRequests(page);
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": ADMIN_ORIGIN },
      body: JSON.stringify({
        token: adminToken(),
        user: { id: "admin-entry-test", username: "admin", role: "ADMIN" },
      }),
    });
  });

  await page.goto("/admin/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("test-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { level: 1, name: "Live operations" })).toBeVisible();
});
