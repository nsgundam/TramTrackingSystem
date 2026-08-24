import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
  type Route as PlaywrightRoute,
} from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";

const mockVehicles = [
  { id: "VH01", name: "Tram 01", type: "tram" },
  { id: "VH02", name: "Tram 02", type: "tram" },
];

const mockRoutes = [
  { id: "R01", name: "Route 01", color: "#2563EB" },
  { id: "R02", name: "Route 02", color: "#16A34A" },
];

const mockTripSummary = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  vehicleId: "VH01",
  routeId: "R01",
  status: "completed",
  startTime: "2026-08-20T08:00:00.000Z",
  endTime: "2026-08-20T09:00:00.000Z",
  lastTripActivityAt: "2026-08-20T09:00:00.000Z",
  closedAt: "2026-08-20T09:00:00.000Z",
  endReason: "explicit_end",
  createdAt: "2026-08-20T08:00:00.000Z",
  vehicle: { id: "VH01", name: "Tram 01", type: "tram" },
  route: { id: "R01", name: "Route 01", color: "#2563EB" },
  trackCount: 42,
};

const mockPoints = [
  {
    id: "point-01",
    recordedAt: "2026-08-20T08:05:00.000Z",
    lat: 13.980123,
    lng: 100.580456,
    speed: "24.5",
    heading: "90",
    station: "Main Station",
    sourceId: "TS_MOB_01",
  },
  {
    id: "point-02",
    recordedAt: "2026-08-20T08:10:00.000Z",
    lat: null,
    lng: null,
    speed: null,
    heading: null,
    station: null,
    sourceId: null,
  },
];

const mockAuditEvents = [
  {
    id: "audit-01",
    actorUserId: "user-super-1",
    actorUsername: "superadmin",
    actorRole: "SUPER_ADMIN",
    action: "vehicle.create",
    targetType: "vehicle",
    targetId: "VH03",
    outcome: "success",
    responseStatus: 201,
    requestId: "req-001",
    occurredAt: "2026-08-21T10:00:00.000Z",
  },
  {
    id: "audit-02",
    actorUserId: "user-super-1",
    actorUsername: "superadmin",
    actorRole: "SUPER_ADMIN",
    action: "device.assign",
    targetType: "tracking_source",
    targetId: "TS_01",
    outcome: "denied",
    responseStatus: 403,
    requestId: "req-002",
    occurredAt: "2026-08-21T11:00:00.000Z",
  },
];

const authenticateAdmin = async (context: BrowserContext, role: "ADMIN" | "SUPER_ADMIN" | "DEV" = "ADMIN") => {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    userId: `user-${role.toLowerCase()}`,
    username: role.toLowerCase(),
  })).toString("base64url");
  await context.addCookies([{
    name: "admin_token",
    value: `header.${payload}.signature`,
    url: ADMIN_ORIGIN,
  }]);
};

const fulfillJson = async (route: PlaywrightRoute, body: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
};

const useRole = async (page: Page, role: "ADMIN" | "SUPER_ADMIN" | "DEV") => {
  await page.route(/\/api\/auth\/me$/, (route) => fulfillJson(route, {
    user: { id: `user-${role.toLowerCase()}`, username: role.toLowerCase(), role },
  }));
};

const blockExternalMapRequests = async (page: Page) => {
  await page.route("https://*.tile.openstreetmap.org/**", (route) => route.abort());
  await page.route("https://cdn-icons-png.flaticon.com/**", (route) => route.abort());
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

const expectNoHorizontalOverflow = async (page: Page) => {
  const hasOverflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth;
  });
  expect(hasOverflow).toBe(false);
};

test.describe("Admin History and Trip History Suite", () => {
  test.beforeEach(async ({ page }) => {
    await blockExternalMapRequests(page);
    // Standard option responses for vehicle/route dropdowns
    await page.route(/\/api\/admin\/vehicles(?:\?|$)/, (route) => {
      if (route.request().method() === "GET") {
        return fulfillJson(route, mockVehicles);
      }
      return route.continue();
    });
    await page.route(/\/api\/admin\/routes(?:\?|$)/, (route) => {
      if (route.request().method() === "GET") {
        return fulfillJson(route, mockRoutes);
      }
      return route.continue();
    });
  });

  test("Sidebar displays Trip History for ADMIN and hides Admin History", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await authenticateAdmin(context, "ADMIN");
    await useRole(page, "ADMIN");

    await page.goto("/admin/dashboard");

    const sidebar = page.locator(".admin-sidebar");
    await expect(sidebar.getByRole("link", { name: "Trip History" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Admin History" })).toHaveCount(0);

    expect(pageErrors).toHaveLength(0);
  });

  test("Sidebar displays both Trip History and Admin History for SUPER_ADMIN", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await authenticateAdmin(context, "SUPER_ADMIN");
    await useRole(page, "SUPER_ADMIN");

    await page.goto("/admin/dashboard");

    const sidebar = page.locator(".admin-sidebar");
    await expect(sidebar.getByRole("link", { name: "Trip History" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Admin History" })).toBeVisible();

    expect(pageErrors).toHaveLength(0);
  });

  test("Ordinary ADMIN on /admin/trip-history sees summaries but NO coordinates, detail links, or export controls", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    let tripHistoryRequestCount = 0;
    await page.route(/\/api\/admin\/trip-history(?:\?|$)/, (route) => {
      tripHistoryRequestCount += 1;
      return fulfillJson(route, {
        data: [mockTripSummary],
        pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
        trackSemantics: "sampled_canonical",
        completeness: "sampled_not_ground_truth",
        coordinatesIncluded: false,
      });
    });

    await authenticateAdmin(context, "ADMIN");
    await useRole(page, "ADMIN");

    await page.goto("/admin/trip-history");

    await expect(page.getByRole("heading", { level: 1, name: "Trip History" })).toBeVisible();
    await expect(page.getByText("Sampled canonical evidence")).toBeVisible();
    await expect(page.locator(".admin-resource-table").getByText("Tram 01 (VH01)")).toBeVisible();
    await expect(page.getByText("42 pts")).toBeVisible();

    // Verify ordinary ADMIN sees NO coordinates, NO detail links, NO export controls
    await expect(page.getByRole("link", { name: "View detail" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /export/i })).toHaveCount(0);
    await expect(page.getByText("13.98")).toHaveCount(0);
    await expect(page.getByText("100.58")).toHaveCount(0);

    expect(tripHistoryRequestCount).toBeGreaterThan(0);
    expect(pageErrors).toHaveLength(0);
  });

  test("Ordinary ADMIN accessing /admin/trip-history/[id] directly sees permission denied and makes no privileged requests", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    let privilegedCalled = false;
    await page.route(/\/api\/admin\/trip-history\/.+/, (route) => {
      privilegedCalled = true;
      return fulfillJson(route, { error: "Forbidden" }, 403);
    });

    await authenticateAdmin(context, "ADMIN");
    await useRole(page, "ADMIN");

    await page.goto(`/admin/trip-history/${mockTripSummary.id}`);

    await expect(page.locator(".admin-access-denied")).toBeVisible();
    await expect(page.getByText(/restricted to Super Admin and Dev/i)).toBeVisible();
    expect(privilegedCalled).toBe(false);
    expect(pageErrors).toHaveLength(0);
  });

  test("Ordinary ADMIN accessing /admin/admin-history directly sees permission denied and makes no audit requests", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    let auditCalled = false;
    await page.route(/\/api\/admin\/admin-history(?:\?|$)/, (route) => {
      auditCalled = true;
      return fulfillJson(route, { error: "Forbidden" }, 403);
    });

    await authenticateAdmin(context, "ADMIN");
    await useRole(page, "ADMIN");

    await page.goto("/admin/admin-history");

    await expect(page.locator(".admin-access-denied")).toBeVisible();
    await expect(page.getByText(/restricted to Super Admin and Dev/i)).toBeVisible();
    expect(auditCalled).toBe(false);
    expect(pageErrors).toHaveLength(0);
  });

  test("SUPER_ADMIN on /admin/trip-history can filter, see detail links, and validate date range", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    const requestedQueries: URLSearchParams[] = [];
    await page.route(/\/api\/admin\/trip-history(?:\?|$)/, (route) => {
      const url = new URL(route.request().url());
      requestedQueries.push(url.searchParams);
      return fulfillJson(route, {
        data: [mockTripSummary],
        pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
        trackSemantics: "sampled_canonical",
        completeness: "sampled_not_ground_truth",
        coordinatesIncluded: false,
      });
    });

    await authenticateAdmin(context, "SUPER_ADMIN");
    await useRole(page, "SUPER_ADMIN");

    await page.goto("/admin/trip-history");

    // Detail link is visible for SUPER_ADMIN
    await expect(page.getByRole("link", { name: "View detail" }).first()).toBeVisible();

    // Test date range validation: from > to
    await page.locator("#filter-from").fill("2026-08-25");
    await page.locator("#filter-to").fill("2026-08-20");
    const countBeforeInvalid = requestedQueries.length;
    await page.getByRole("button", { name: "Apply filters" }).click();

    await expect(page.getByText("Start date must be on or before end date.")).toBeVisible();
    expect(requestedQueries.length).toBe(countBeforeInvalid);

    // Apply valid filters
    await page.locator("#filter-vehicle").selectOption("VH01");
    await page.locator("#filter-status").selectOption("completed");
    await page.locator("#filter-from").fill("2026-08-01");
    await page.locator("#filter-to").fill("2026-08-24");
    await page.getByRole("button", { name: "Apply filters" }).click();

    const lastQuery = requestedQueries[requestedQueries.length - 1];
    expect(lastQuery.get("vehicleId")).toBe("VH01");
    expect(lastQuery.get("status")).toBe("completed");
    expect(lastQuery.get("from")).toBe("2026-07-31T17:00:00.000Z");
    expect(lastQuery.get("to")).toBe("2026-08-24T16:59:59.999Z");

    // Test reset filters
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.locator("#filter-vehicle")).toHaveValue("");
    await expect(page.locator("#filter-status")).toHaveValue("");

    expect(pageErrors).toHaveLength(0);
  });

  test("SUPER_ADMIN on /admin/trip-history/[id] views sampled points and downloads CSV export", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    let detailPageRequested = 0;
    await page.route(new RegExp(`/api/admin/trip-history/${mockTripSummary.id}(?:\\?|$)`), (route) => {
      detailPageRequested += 1;
      return fulfillJson(route, {
        trip: mockTripSummary,
        points: mockPoints,
        pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
        trackSemantics: "sampled_canonical",
        completeness: "sampled_not_ground_truth",
      });
    });

    let exportCalled = false;
    await page.route(new RegExp(`/api/admin/trip-history/${mockTripSummary.id}/export`), async (route) => {
      exportCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "text/csv",
        headers: {
          "Content-Disposition": `attachment; filename="trip-${mockTripSummary.id}.csv"`,
        },
        body: "recordedAt,lat,lng,speed,heading,station,sourceId\n2026-08-20T08:05:00.000Z,13.980123,100.580456,24.5,90,Main Station,TS_MOB_01",
      });
    });

    await authenticateAdmin(context, "SUPER_ADMIN");
    await useRole(page, "SUPER_ADMIN");

    await page.goto(`/admin/trip-history/${mockTripSummary.id}`);

    await expect(page.getByRole("heading", { level: 1, name: `Trip ${mockTripSummary.id}` })).toBeVisible();
    await expect(page.getByText("Sampled canonical points")).toBeVisible();
    await expect(page.getByText("Points displayed below are sampled canonical telemetry records")).toBeVisible();

    // Check points rendered in table (point 1 formatted from strings/numbers, point 2 safe em dashes)
    await expect(page.locator(".admin-resource-table").getByText("13.980123")).toBeVisible();
    await expect(page.locator(".admin-resource-table").getByText("100.580456")).toBeVisible();
    await expect(page.locator(".admin-resource-table").getByText("24.5 km/h")).toBeVisible();
    await expect(page.locator(".admin-resource-table").getByText("90°")).toBeVisible();
    await expect(page.locator(".admin-resource-table").getByText("—").first()).toBeVisible();

    // Trigger CSV export
    const exportBtn = page.getByRole("button", { name: /export csv/i });
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();

    await expect(page.getByText(/Exported trip-.+\.csv successfully/)).toBeVisible();
    expect(exportCalled).toBe(true);
    expect(detailPageRequested).toBeGreaterThan(0);
    expect(pageErrors).toHaveLength(0);
  });

  test("SUPER_ADMIN on /admin/admin-history views audit events with filters and verifies NO export control", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    const requestedAuditQueries: URLSearchParams[] = [];
    await page.route(/\/api\/admin\/admin-history(?:\?|$)/, (route) => {
      const url = new URL(route.request().url());
      requestedAuditQueries.push(url.searchParams);
      return fulfillJson(route, {
        data: mockAuditEvents,
        pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
      });
    });

    await authenticateAdmin(context, "SUPER_ADMIN");
    await useRole(page, "SUPER_ADMIN");

    await page.goto("/admin/admin-history");

    await expect(page.getByRole("heading", { level: 1, name: "Admin History" })).toBeVisible();
    await expect(page.getByText("Audit ledger policy")).toBeVisible();
    await expect(page.getByText("Request payloads, secrets, coordinates, and sensitive operational data are deliberately excluded")).toBeVisible();

    // Verify events table
    await expect(page.locator(".admin-resource-table").getByText("vehicle.create")).toBeVisible();
    await expect(page.locator(".admin-resource-table").getByText("device.assign")).toBeVisible();
    await expect(page.locator(".admin-resource-table").getByText("superadmin").first()).toBeVisible();

    // Verify ABSOLUTELY NO export button exists
    await expect(page.getByRole("button", { name: /export/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /export/i })).toHaveCount(0);

    // Apply action filter
    await page.locator("#filter-action").selectOption("vehicle.create");
    await page.locator("#filter-outcome").selectOption("success");
    await page.getByRole("button", { name: "Apply filters" }).click();

    const lastQuery = requestedAuditQueries[requestedAuditQueries.length - 1];
    expect(lastQuery.get("action")).toBe("vehicle.create");
    expect(lastQuery.get("outcome")).toBe("success");

    expect(pageErrors).toHaveLength(0);
  });

  test("Mobile 390px viewport renders stacked records with no horizontal overflow and touch targets >= 44px", async ({ page, context }) => {
    const pageErrors: Error[] = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.setViewportSize({ width: 390, height: 844 });

    await page.route(/\/api\/admin\/trip-history(?:\?|$)/, (route) => {
      return fulfillJson(route, {
        data: [mockTripSummary],
        pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
        trackSemantics: "sampled_canonical",
        completeness: "sampled_not_ground_truth",
        coordinatesIncluded: false,
      });
    });

    await page.route(new RegExp(`/api/admin/trip-history/${mockTripSummary.id}(?:\\?|$)`), (route) => {
      return fulfillJson(route, {
        trip: mockTripSummary,
        points: mockPoints,
        pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
        trackSemantics: "sampled_canonical",
        completeness: "sampled_not_ground_truth",
      });
    });

    await page.route(/\/api\/admin\/admin-history(?:\?|$)/, (route) => {
      return fulfillJson(route, {
        data: mockAuditEvents,
        pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
      });
    });

    await authenticateAdmin(context, "SUPER_ADMIN");
    await useRole(page, "SUPER_ADMIN");

    // 1. Trip History list on mobile
    await page.goto("/admin/trip-history");
    await expect(page.locator(".admin-trip-record-card")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectMinimumTarget(page.locator(".admin-history-filters-actions button"));

    // 2. Trip detail on mobile
    await page.goto(`/admin/trip-history/${mockTripSummary.id}`);
    await expect(page.locator(".admin-point-card").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectMinimumTarget(page.locator(".admin-back-link"));

    // 3. Admin History on mobile
    await page.goto("/admin/admin-history");
    await expect(page.locator(".admin-audit-record-card").first()).toBeVisible();
    await expectNoHorizontalOverflow(page);

    expect(pageErrors).toHaveLength(0);
  });
});
