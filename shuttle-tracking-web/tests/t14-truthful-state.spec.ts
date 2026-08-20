import { expect, test } from "@playwright/test";

test.describe("Public Feedback", () => {
  test.use({ serviceWorkers: "block" });

  test("T14 Feedback allows general feedback and recovers with an explicit verified vehicle", async ({ page }) => {
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
    await page.route("http://127.0.0.1:13001/api/public/feedback", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
        return;
      }
      const data = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ success: true, data: { id: "test-feedback", vehicleId: data?.vehicleId ?? null } }),
      });
    });

    await page.goto("/");
    await expect(page.locator(".preloader-overlay")).toHaveCount(0);
    await expect(page.getByTestId("availability-card")).toContainText("Active Trams");

    const armFailure = await page.request.get("http://127.0.0.1:13001/t14/fail-next-active-vehicles");
    expect(armFailure.ok()).toBe(true);
    await page.getByRole("button", { name: "ส่งข้อเสนอแนะ" }).click();

    await expect(page.getByTestId("feedback-vehicle-region")).toHaveCount(0);
    await expect(page.getByText("ไม่สามารถโหลดรายชื่อรถได้ จึงยังไม่สามารถผูกข้อเสนอแนะกับรถคันใดได้")).toHaveCount(0);
    await expect(page.getByText(/VH001|VH002/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeDisabled();

    // General feedback can be submitted when vehicle list loading fails in the background
    await page.getByLabel("รายละเอียดข้อเสนอแนะ / ปัญหาที่พบ").fill("แจ้งปัญหาการใช้งานเว็บไซต์");
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeEnabled();

    const generalSubmission = page.waitForRequest((request) =>
      request.method() === "POST" && request.url().endsWith("/api/public/feedback")
    );
    await page.getByRole("button", { name: "ส่งข้อมูล" }).click();
    const generalFeedbackRequest = await generalSubmission;
    expect(generalFeedbackRequest.postDataJSON()).toMatchObject({
      type: "suggestion",
      vehicleId: null,
      message: "แจ้งปัญหาการใช้งานเว็บไซต์",
    });
    await expect(page.getByText("ส่งข้อมูลสำเร็จ!")).toBeVisible();
    await expect(page.getByRole("dialog", { name: "ส่งข้อเสนอแนะ / แจ้งปัญหา" })).toHaveCount(0);

    // Reopen modal with failure armed, verify loading error only appears after choosing tram
    const armFailure2 = await page.request.get("http://127.0.0.1:13001/t14/fail-next-active-vehicles");
    expect(armFailure2.ok()).toBe(true);
    await page.getByRole("button", { name: "ส่งข้อเสนอแนะ" }).click();
    await expect(page.getByTestId("feedback-vehicle-region")).toHaveCount(0);
    await expect(page.getByText("ไม่สามารถโหลดรายชื่อรถได้ จึงยังไม่สามารถผูกข้อเสนอแนะกับรถคันใดได้")).toHaveCount(0);

    // Choosing tram reveals the conditional vehicle region with the error state
    await page.getByRole("button", { name: "ข้อเสนอแนะเกี่ยวกับรถรางที่กำลังนั่ง" }).click();
    await expect(page.getByTestId("feedback-vehicle-region")).toBeVisible();
    await expect(page.getByText("ไม่สามารถโหลดรายชื่อรถได้ จึงยังไม่สามารถผูกข้อเสนอแนะกับรถคันใดได้")).toBeVisible();
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeDisabled();

    // Switching back to General clears vehicle selection and allows submit
    await page.getByLabel("รายละเอียดข้อเสนอแนะ / ปัญหาที่พบ").fill("รถมีปัญหา");
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeDisabled();
    await page.getByRole("button", { name: "ข้อเสนอแนะทั่วไป" }).click();
    await expect(page.getByTestId("feedback-vehicle-region")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeEnabled();

    // Switch back to tram mode
    await page.getByRole("button", { name: "ข้อเสนอแนะเกี่ยวกับรถรางที่กำลังนั่ง" }).click();
    await expect(page.getByTestId("feedback-vehicle-region")).toBeVisible();
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeDisabled();

    // Arm empty active vehicles response, verify empty state appears after choosing tram / retrying
    const armEmpty = await page.request.get("http://127.0.0.1:13001/t14/empty-next-active-vehicles");
    expect(armEmpty.ok()).toBe(true);
    await page.getByRole("button", { name: "ลองโหลดรายชื่อรถอีกครั้ง" }).click();
    await expect(page.getByText("ขณะนี้ไม่มีรถที่เปิดให้เลือก กรุณาลองใหม่ภายหลัง")).toBeVisible();
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeDisabled();

    // Retry successfully to load active vehicles; cards are rendered and selecting one enables submit
    await page.getByRole("button", { name: "ลองโหลดรายชื่อรถอีกครั้ง" }).click();
    const vehicleRegion = page.getByTestId("feedback-vehicle-region");
    await expect(vehicleRegion).toBeVisible();
    const vehicleCard = vehicleRegion.getByRole("button", { name: /T8 Test Tram|t8-vehicle/ });
    await expect(vehicleCard).toBeVisible();
    await expect(vehicleCard).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeDisabled();

    await vehicleCard.click();
    await expect(vehicleCard).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "ส่งข้อมูล" })).toBeEnabled();

    const submission = page.waitForRequest((request) =>
      request.method() === "POST" && request.url().endsWith("/api/public/feedback")
    );
    await page.getByRole("button", { name: "ส่งข้อมูล" }).click();
    const feedbackRequest = await submission;
    expect(feedbackRequest.postDataJSON()).toMatchObject({
      type: "suggestion",
      vehicleId: "t8-vehicle",
      message: "รถมีปัญหา",
    });
    await expect(page.getByText("ส่งข้อมูลสำเร็จ!")).toBeVisible();
  });
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
