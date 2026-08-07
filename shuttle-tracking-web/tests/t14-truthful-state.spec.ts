import { expect, test } from "@playwright/test";

test("T14 Feedback fails closed on mobile and recovers with an explicit verified vehicle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("rsu-bus-tour-seen", "true");
  });
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
  await page.route("http://localhost:3001/**", (route) => route.abort());
  await page.route("http://127.0.0.1:3001/**", (route) => route.abort());

  await page.goto("/");
  await expect(page.locator(".preloader-overlay")).toHaveCount(0);
  await expect(page.getByTestId("availability-card")).toContainText("Active Trams");

  const armFailure = await page.request.get("http://127.0.0.1:13001/t14/fail-next-active-vehicles");
  expect(armFailure.ok()).toBe(true);
  await page.getByRole("button", { name: "ส่งข้อเสนอแนะ" }).click();

  await expect(page.getByText("ไม่สามารถโหลดรายชื่อรถได้ จึงยังไม่สามารถผูกข้อเสนอแนะกับรถคันใดได้")).toBeVisible();
  await expect(page.getByText(/VH001|VH002/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeDisabled();

  const armEmpty = await page.request.get("http://127.0.0.1:13001/t14/empty-next-active-vehicles");
  expect(armEmpty.ok()).toBe(true);
  await page.getByRole("button", { name: "ลองโหลดรายชื่อรถอีกครั้ง" }).click();
  await expect(page.getByText("ขณะนี้ไม่มีรถที่เปิดให้เลือก กรุณาลองใหม่ภายหลัง")).toBeVisible();
  await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeDisabled();
  await page.getByRole("button", { name: "ลองโหลดรายชื่อรถอีกครั้ง" }).click();
  const vehicleSelect = page.getByLabel("เลือกหมายเลขรถรถราง");
  await expect(vehicleSelect).toBeVisible();
  await expect(vehicleSelect).toHaveValue("");
  await vehicleSelect.selectOption("t8-vehicle");
  await page.getByLabel("รายละเอียดข้อเสนอแนะ / ปัญหาที่พบ").fill("รถมาถึงช้ากว่าที่แสดง");

  const submission = page.waitForRequest((request) =>
    request.method() === "POST" && request.url().endsWith("/api/public/feedback")
  );
  await page.getByRole("button", { name: "ส่งข้อมูล" }).click();
  const feedbackRequest = await submission;
  expect(feedbackRequest.postDataJSON()).toMatchObject({ vehicleId: "t8-vehicle" });
  await expect(page.getByText("ส่งข้อมูลสำเร็จ!")).toBeVisible();
});

test("T14 Admin reports unavailable data, retries, and expires live state to last-known", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("https://cdn-icons-png.flaticon.com/**", (route) => route.abort());

  const statsFailure = await page.request.get(
    "http://127.0.0.1:13001/t14/admin-stats-mode?mode=error",
  );
  const snapshotFailure = await page.request.get(
    "http://127.0.0.1:13001/t14/fail-next-active-vehicles?count=2",
  );
  expect(statsFailure.ok()).toBe(true);
  expect(snapshotFailure.ok()).toBe(true);

  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    userId: "t14-admin",
    username: "admin",
  })).toString("base64url");
  await context.addCookies([{
    name: "admin_token",
    value: `header.${payload}.signature`,
    url: "http://127.0.0.1:13000",
  }]);

  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByTestId("admin-dashboard-status")).toContainText("Dashboard data unavailable");
  await expect(page.getByTestId("admin-stat-vehicles")).toHaveText("—");
  await expect(page.getByTestId("admin-stat-routes")).toHaveText("—");
  await expect(page.getByTestId("admin-stat-stops")).toHaveText("—");
  await expect(page.getByText(/Live System Active|active & tracking/i)).toHaveCount(0);

  await expect(page.getByTestId("admin-realtime-status")).toContainText("Snapshot: Unavailable");
  await expect(page.getByTestId("admin-realtime-status")).toContainText("Realtime: Connected");

  const statsReady = await page.request.get(
    "http://127.0.0.1:13001/t14/admin-stats-mode?mode=ready",
  );
  expect(statsReady.ok()).toBe(true);
  await page.getByTestId("admin-dashboard-retry").click();
  await expect(page.getByTestId("admin-dashboard-status")).toContainText("Updated");
  await expect(page.getByTestId("admin-stat-vehicles")).toHaveText("1");
  await expect(page.getByTestId("admin-stat-routes")).toHaveText("2");
  await expect(page.getByTestId("admin-stat-stops")).toHaveText("4");

  await page.getByTestId("admin-snapshot-retry").click();
  await expect(page.getByTestId("admin-realtime-status")).toContainText("Snapshot: Ready");
  await expect(page.getByTestId("admin-state-summary")).toContainText("Live: 1");

  const expiryResponse = await page.request.get("http://127.0.0.1:13001/t8/arm-expiry");
  expect(expiryResponse.ok()).toBe(true);
  await expect(page.getByTestId("admin-state-summary")).toContainText("Live: 0");
  await expect(page.getByTestId("admin-state-summary")).toContainText("Last known: 1");
});
