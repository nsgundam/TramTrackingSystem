import { expect, test } from "@playwright/test";

test("T8 keeps an expired Marker hidden across route switching until newer live state arrives", async ({ page }) => {
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
  await page.route("http://localhost:3001/**", (route) => route.abort());
  await page.route("http://127.0.0.1:3001/**", (route) => route.abort());

  const socketRequest = page.waitForRequest((request) => request.url().includes("/socket.io/"));
  await page.goto("/");
  expect((await socketRequest).url()).toContain("127.0.0.1:13001");

  await expect(page.locator(".preloader-overlay")).toHaveCount(0);

  const availability = page.getByTestId("availability-card");
  const markers = page.locator(".bus-marker-tour");
  const routeMenu = page.locator(".route-selector-menu");

  await expect(availability).toContainText("1 คัน");
  await expect(markers).toHaveCount(1);

  await expect.poll(async () => {
    const response = await page.request.get("http://127.0.0.1:13001/t8/connection-count");
    return (await response.json()).connectionCount;
  }).toBeGreaterThanOrEqual(1);
  await page.waitForTimeout(250);

  const expiryResponse = await page.request.get("http://127.0.0.1:13001/t8/arm-expiry");
  expect(expiryResponse.ok()).toBe(true);
  await expect(availability).toContainText("ข้อมูลตำแหน่งล่าช้า");
  await expect(availability).toContainText("1 คัน");
  await expect(markers).toHaveCount(0);

  await routeMenu.getByRole("button", { name: /Route 01/ }).click();
  await routeMenu.getByRole("button", { name: "Route 02" }).click();
  await routeMenu.getByRole("button", { name: /Route 02/ }).click();
  await routeMenu.getByRole("button", { name: "Route 01" }).click();

  await expect(markers).toHaveCount(0);
  const restoreResponse = await page.request.get("http://127.0.0.1:13001/t8/restore");
  expect(restoreResponse.ok()).toBe(true);
  await expect(availability).toContainText("Active Trams");
  await expect(availability).toContainText("1 คัน");
  await expect(markers).toHaveCount(1);
});
