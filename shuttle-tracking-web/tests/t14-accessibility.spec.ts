import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";

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

test("T14 Public document, Feedback, and stop-image dialogs support keyboard access", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await context.grantPermissions(["geolocation"], { origin: ADMIN_ORIGIN });
  await context.setGeolocation({ latitude: 13.98, longitude: 100.58 });
  await page.addInitScript(() => localStorage.setItem("rsu-bus-tour-seen", "true"));
  await blockExternalMapRequests(page);

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  const viewportContent = await page.locator('meta[name="viewport"]').getAttribute("content");
  expect(viewportContent).not.toContain("maximum-scale");
  expect(viewportContent).not.toContain("user-scalable=no");

  const feedbackInvoker = page.getByRole("button", { name: "ส่งข้อเสนอแนะ" });
  await feedbackInvoker.click();
  const feedbackDialog = page.getByRole("dialog", { name: "ส่งข้อเสนอแนะ / แจ้งปัญหา" });
  await expect(feedbackDialog).toBeVisible();
  const feedbackClose = feedbackDialog.getByRole("button", { name: "ปิดหน้าต่างข้อเสนอแนะ" });
  await expect(feedbackClose).toBeFocused();

  const suggestion = feedbackDialog.getByRole("button", { name: "ข้อเสนอแนะ", exact: true });
  const complaint = feedbackDialog.getByRole("button", { name: "แจ้งปัญหา / ร้องเรียน" });
  await expect(suggestion).toHaveAttribute("aria-pressed", "true");
  await complaint.click();
  await expect(complaint).toHaveAttribute("aria-pressed", "true");
  await expect(suggestion).toHaveAttribute("aria-pressed", "false");

  await feedbackClose.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(feedbackDialog.getByRole("button", { name: "ยกเลิก" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(feedbackClose).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(feedbackDialog).toHaveCount(0);
  await expect(feedbackInvoker).toBeFocused();

  await page.getByTitle("Current Location").click();
  const imageInvoker = page.getByRole("button", { name: "คลิกเพื่อขยายรูป: R01 Start" });
  await expect(imageInvoker).toBeVisible();
  await imageInvoker.click();
  const imageDialog = page.getByRole("dialog", { name: "รูปขยาย: R01 Start" });
  await expect(imageDialog.getByRole("button", { name: "ปิดรูปภาพ" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(imageDialog).toHaveCount(0);
  await expect(imageInvoker).toBeFocused();
});

test("T14 Mobile Admin drawer is inert when closed and traps/restores focus when open", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await blockExternalMapRequests(page);

  await page.goto("/admin/dashboard");
  const menuButton = page.getByRole("button", { name: "Open sidebar" });
  const sidebar = page.locator("#admin-sidebar");
  await expect(sidebar).toHaveAttribute("inert", "");
  await expect(sidebar).toHaveAttribute("aria-hidden", "true");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");

  await menuButton.click();
  const drawer = page.getByRole("dialog", { name: "Admin navigation" });
  const closeButton = drawer.getByRole("button", { name: "Close sidebar" });
  await expect(closeButton).toBeFocused();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(drawer.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");

  await page.keyboard.press("Shift+Tab");
  await expect(drawer.getByRole("button", { name: "Logout" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
  await expect(sidebar).toHaveAttribute("inert", "");
  await expect(menuButton).toBeFocused();

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(sidebar).not.toHaveAttribute("inert", "");
  await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
});

test("T14 Admin login and CRUD dialogs expose names, labels, wrapping, and restoration", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/admin/login");
  await expect(page.getByLabel("Username")).toHaveAttribute("autocomplete", "username");
  await expect(page.getByLabel("Password")).toHaveAttribute("autocomplete", "current-password");

  await authenticateAdmin(context);
  await page.goto("/admin/routes");
  const addRoute = page.getByRole("button", { name: "Add Route" });
  await addRoute.click();
  const routeDialog = page.getByRole("dialog", { name: "Add New Route" });
  const routeClose = routeDialog.getByRole("button", { name: "Close route dialog" });
  await expect(routeClose).toBeFocused();
  await expect(routeDialog.getByLabel("Route ID")).toBeVisible();
  await expect(routeDialog.getByLabel("Route Name")).toBeVisible();
  await expect(routeDialog.getByLabel("Route Color")).toBeVisible();
  await expect(routeDialog.getByLabel("Status")).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  await expect(routeDialog.getByRole("button", { name: "Create Route" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(routeClose).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(addRoute).toBeFocused();

  await page.goto("/admin/stops");
  const addStop = page.getByRole("button", { name: "Add Stop" });
  await addStop.click();
  const stopDialog = page.getByRole("dialog", { name: "Add New Stop" });
  await expect(stopDialog.getByRole("button", { name: "Close stop dialog" })).toBeFocused();
  for (const label of ["Stop ID", "Name (TH)", "Name (EN)", "Latitude", "Longitude"]) {
    await expect(stopDialog.getByLabel(label, { exact: true })).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(addStop).toBeFocused();

  await page.goto("/admin/vehicles");
  const addVehicle = page.getByRole("button", { name: "Add Vehicle" });
  await addVehicle.click();
  const vehicleDialog = page.getByRole("dialog", { name: "Add New Vehicle" });
  await expect(vehicleDialog.getByRole("button", { name: "Close vehicle dialog" })).toBeFocused();
  for (const label of ["Vehicle ID", "Vehicle Name", "Type", "Status", "Assign Route"]) {
    await expect(vehicleDialog.getByLabel(label, { exact: true })).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(addVehicle).toBeFocused();
});

test("T14 Route-stop and sensitive Feedback dialogs retain safe focus semantics", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);

  await page.goto("/admin/routes");
  const manageStops = page.getByRole("button", { name: "Manage stops for Route 01" }).first();
  await manageStops.click();
  const routeStopsDialog = page.getByRole("dialog", { name: "Route stops" });
  await expect(routeStopsDialog.getByRole("button", { name: "Close route stops manager" })).toBeFocused();
  await expect(routeStopsDialog.getByLabel("Add active stop")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(manageStops).toBeFocused();

  await page.route(/\/api\/auth\/me$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ user: { id: "t14-super", username: "super", role: "SUPER_ADMIN" } }),
    });
  });
  await page.route(/\/api\/admin\/feedback\/deleted$/, async (route) => {
    await route.fulfill({ contentType: "application/json", body: "[]" });
  });
  await page.route(/\/api\/admin\/feedback$/, async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([{
        id: "feedback-a11y",
        type: "complaint",
        vehicle: null,
        message: "Accessibility fixture",
        status: "new",
        assignedTo: null,
        internalNote: null,
        createdAt: "2026-08-09T00:00:00.000Z",
        deletedAt: null,
        deletionReason: null,
        restoreExpiresAt: null,
      }]),
    });
  });

  await page.goto("/admin/feedback");
  const internalNote = page.getByLabel("Internal note for feedback feedback-a11y");
  await expect(internalNote).toBeVisible();
  const deleteInvoker = page.getByRole("button", { name: "Delete" }).first();
  await deleteInvoker.click();
  const confirmationDialog = page.getByRole("dialog", { name: "Recent authentication required" });
  await expect(confirmationDialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  const reason = confirmationDialog.getByLabel("Deletion reason");
  await expect(reason).toBeVisible();
  await expect(confirmationDialog.getByLabel("Current password")).toHaveAttribute("autocomplete", "current-password");
  await reason.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(confirmationDialog.getByRole("button", { name: "Delete" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(reason).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(confirmationDialog).toHaveCount(0);
  await expect(deleteInvoker).toBeFocused();
});
