import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
  type Route as PlaywrightRoute,
} from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";

const sources = [
  {
    id: "TS_MOB_01",
    name: "Mobile source",
    type: "mobile",
    vehicleId: "VH001",
    priority: 1,
    status: "active",
    lastTelemetryAt: "2026-08-10T01:30:00.000Z",
    activeAssignment: {
      id: "assignment-1",
      vehicleId: "VH001",
      assignedAt: "2026-08-01T00:00:00.000Z",
      unassignedAt: null,
      method: "admin",
      vehicle: { id: "VH001", name: "Tram 01" },
    },
  },
  {
    id: "TS_LORA_01",
    name: "LoRaWAN source",
    type: "lorawan",
    vehicleId: null,
    priority: 2,
    status: "active",
    lastTelemetryAt: null,
    activeAssignment: null,
  },
] as const;

const vehicles = [
  { id: "VH001", name: "Tram 01" },
  { id: "VH002", name: "Tram 02" },
] as const;

const sourceHealth = [
  {
    sourceId: "TS_MOB_01",
    sourceType: "mobile",
    vehicle: { id: "VH001", name: "Tram 01" },
    freshness: "online",
    lastTelemetryAt: "2026-08-10T01:30:00.000Z",
    status: "active",
    errorCategory: "none",
  },
  {
    sourceId: "TS_LORA_01",
    sourceType: "lorawan",
    vehicle: null,
    freshness: "offline",
    lastTelemetryAt: null,
    status: "registered",
    errorCategory: "offline",
  },
] as const;

const activeCase = {
  id: "feedback-ops",
  type: "complaint",
  vehicle: { id: "VH001", name: "Tram 01" },
  message: "The pickup point sign is difficult to find.",
  status: "new",
  assignedTo: { id: "admin-1", username: "super", role: "SUPER_ADMIN" },
  internalNote: "Check with facilities.",
  createdAt: "2026-08-09T07:30:00.000Z",
  deletedAt: null,
  deletionReason: null,
  restoreExpiresAt: null,
} as const;

const secondaryActiveCase = {
  ...activeCase,
  id: "feedback-secondary",
  message: "The timetable display is difficult to read.",
  internalNote: null,
} as const;

const deletedCase = {
  ...activeCase,
  id: "feedback-deleted",
  status: "resolved",
  deletedAt: "2026-08-10T00:00:00.000Z",
  deletionReason: "privacy_request",
  restoreExpiresAt: "2026-09-09T00:00:00.000Z",
} as const;

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

const fulfillJson = async (route: PlaywrightRoute, body: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
};

interface FeedbackApiResponse {
  status: number;
  body: unknown;
}

const deferredFeedbackResponse = () => {
  let settle: ((response: FeedbackApiResponse) => void) | undefined;
  const response = new Promise<FeedbackApiResponse>((resolve) => {
    settle = resolve;
  });

  return {
    response,
    resolve(value: FeedbackApiResponse) {
      if (!settle) throw new Error("Feedback response was not initialized");
      settle(value);
    },
  };
};

const useRole = async (page: Page, role: "ADMIN" | "SUPER_ADMIN" | "DEV") => {
  await page.route(/\/api\/auth\/me$/, (route) => fulfillJson(route, {
    user: { id: `t14-${role.toLowerCase()}`, username: role.toLowerCase(), role },
  }));
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

const expectSolidPresentation = async (locator: Locator) => {
  const presentation = await locator.evaluate((element) => {
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
};

const expectGlassPresentation = async (locator: Locator) => {
  const presentation = await locator.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      backdropFilter: styles.backdropFilter,
      transform: styles.transform,
    };
  });
  expect(presentation).toMatchObject({
    backgroundImage: "none",
    transform: "none",
  });
  expect(presentation.backdropFilter).toContain("blur(");
};

const useFeedbackApi = async (
  page: Page,
  options: {
    activeResponse?: () => FeedbackApiResponse | Promise<FeedbackApiResponse>;
    onPatch?: (body: unknown) => void;
    patchResponse?: (body: unknown) => FeedbackApiResponse | Promise<FeedbackApiResponse>;
    onDelete?: (body: unknown) => void;
    onRestore?: (body: unknown | null) => void;
  } = {},
) => {
  await page.route("**/api/admin/feedback**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/admin/feedback/deleted") {
      await fulfillJson(route, [deletedCase]);
      return;
    }
    if (pathname === "/api/admin/feedback" && request.method() === "GET") {
      const response = await (options.activeResponse?.() ?? {
        status: 200,
        body: [activeCase],
      });
      await fulfillJson(route, response.body, response.status);
      return;
    }
    if (pathname === `/api/admin/feedback/${activeCase.id}` && request.method() === "PATCH") {
      const body = request.postDataJSON();
      options.onPatch?.(body);
      const response = await (options.patchResponse?.(body) ?? {
        status: 200,
        body: { success: true },
      });
      await fulfillJson(route, response.body, response.status);
      return;
    }
    if (pathname === `/api/admin/feedback/${activeCase.id}/delete`) {
      options.onDelete?.(request.postDataJSON());
      await fulfillJson(route, { success: true });
      return;
    }
    if (pathname === `/api/admin/feedback/${deletedCase.id}/restore`) {
      options.onRestore?.(request.postDataJSON());
      await fulfillJson(route, { success: true });
      return;
    }
    await fulfillJson(route, { success: true });
  });
};

test("T14 Tracking Source registry keeps health, assignment, and lifecycle boundaries visible", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  await useRole(page, "ADMIN");
  await page.route(/\/api\/admin\/devices$/, (route) => fulfillJson(route, sources));
  await page.route(/\/api\/admin\/devices\/health$/, (route) => fulfillJson(route, sourceHealth));
  await page.route(/\/api\/admin\/vehicles$/, (route) => fulfillJson(route, vehicles));

  await page.goto("/admin/devices");
  const sourcePage = page.locator('[data-admin-resource="source-health"]');
  await expect(sourcePage).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Tracking Sources" })).toBeVisible();
  await expect(sourcePage.locator('[data-admin-notice="info"]')).toContainText("Telemetry health never starts or ends service");
  const registry = sourcePage.locator(".admin-source-registry");
  await expect(registry).toBeVisible();
  const firstRecord = registry.locator("article").first();
  await expect(firstRecord).toContainText("mobile");
  await expect(firstRecord).toContainText("Tram 01 (VH001)");
  await expect(firstRecord).toContainText("10 Aug 2026, 08:30 ICT");
  await expect(firstRecord).toContainText("Registry status");
  await expect(firstRecord).toContainText("Save assignment");
  await expect(firstRecord).not.toContainText(/credential|payload|location|IP address/i);
  await expectSolidPresentation(sourcePage.locator("[data-admin-resource-panel]").first());
  await expectMinimumTarget(sourcePage.locator("[data-admin-resource-action]:visible"));
});

test("T14 Tracking Source initial failure is distinct from empty and retryable on Mobile", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await useRole(page, "ADMIN");
  let shouldFail = true;
  await page.route(/\/api\/admin\/devices$/, (route) => fulfillJson(route, shouldFail ? { error: "Temporarily unavailable" } : [] , shouldFail ? 503 : 200));
  await page.route(/\/api\/admin\/devices\/health$/, (route) => (
    shouldFail
      ? fulfillJson(route, { error: "Temporarily unavailable" }, 503)
      : fulfillJson(route, [])
  ));
  await page.route(/\/api\/admin\/vehicles$/, (route) => fulfillJson(route, []));

  await page.goto("/admin/devices");
  await expect(page.getByRole("alert").filter({
    hasText: "Unable to load source registry and health state",
  })).toBeVisible();
  await expect(page.getByText("No sources are registered.")).toBeHidden();
  shouldFail = false;
  await page.getByRole("button", { name: "Retry loading source registry" }).click();
  await expect(page.getByText("No sources are registered.")).toBeVisible();
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  await expectMinimumTarget(page.locator("[data-admin-resource-action]:visible"));
});

test("T14 Feedback Inbox retains the T12 role boundary", async ({ page, context }) => {
  await authenticateAdmin(context);
  await useRole(page, "ADMIN");
  let feedbackGets = 0;
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;
    if (request.method() === "GET" && (
      pathname === "/api/admin/feedback"
      || pathname === "/api/admin/feedback/deleted"
    )) {
      feedbackGets += 1;
    }
  });
  await useFeedbackApi(page);

  await page.goto("/admin/feedback");
  await expect(page.getByRole("alert").filter({
    hasText: "Feedback triage is restricted to Super Admin and Dev roles.",
  })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Feedback Inbox" })).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  expect(feedbackGets).toBe(0);
});

test("T14 Feedback session hydration remains neutral before privileged reads", async ({ page, context }) => {
  await authenticateAdmin(context);

  let markAuthRequestStarted: (() => void) | undefined;
  const authRequestStarted = new Promise<void>((resolve) => {
    markAuthRequestStarted = resolve;
  });
  let releaseAuthResponse: (() => void) | undefined;
  const authResponseGate = new Promise<void>((resolve) => {
    releaseAuthResponse = resolve;
  });
  await page.route(/\/api\/auth\/me$/, async (route) => {
    markAuthRequestStarted?.();
    await authResponseGate;
    await fulfillJson(route, {
      user: { id: "t14-super_admin", username: "super_admin", role: "SUPER_ADMIN" },
    });
  });

  let activeFeedbackGets = 0;
  let deletedFeedbackGets = 0;
  page.on("request", (request) => {
    if (request.method() !== "GET") return;
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/admin/feedback") activeFeedbackGets += 1;
    if (pathname === "/api/admin/feedback/deleted") deletedFeedbackGets += 1;
  });
  await useFeedbackApi(page);

  await page.goto("/admin/feedback");
  await authRequestStarted;

  const verificationStatus = page.getByRole("status").filter({
    hasText: "Verifying feedback access…",
  });
  const restrictionAlert = page.getByRole("alert").filter({
    hasText: "Feedback triage is restricted to Super Admin and Dev roles.",
  });
  try {
    await expect(verificationStatus).toBeVisible();
    await expect(restrictionAlert).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Feedback Inbox" })).toHaveCount(0);
    await expect(page.locator('[data-admin-operations-ledger="feedback"]')).toHaveCount(0);
    expect(activeFeedbackGets).toBe(0);
    expect(deletedFeedbackGets).toBe(0);
  } finally {
    releaseAuthResponse?.();
  }

  await expect(verificationStatus).toBeHidden();
  await expect(restrictionAlert).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Feedback Inbox" })).toBeVisible();
  await expect(page.locator('[data-admin-operations-ledger="feedback"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recoverable deletions" })).toBeVisible();
  await expect.poll(() => ({ activeFeedbackGets, deletedFeedbackGets })).toEqual({
    activeFeedbackGets: 1,
    deletedFeedbackGets: 1,
  });
});

test("T14 Feedback initial failure is not an empty queue and retry restores the case ledger", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  await useRole(page, "SUPER_ADMIN");
  let shouldFail = true;
  await useFeedbackApi(page, {
    activeResponse: () => shouldFail
      ? { status: 503, body: { error: "Temporarily unavailable" } }
      : { status: 200, body: [activeCase] },
  });

  await page.goto("/admin/feedback");
  const feedbackPage = page.locator('[data-admin-resource="feedback"]');
  await expect(feedbackPage).toBeVisible();
  await expect(feedbackPage.locator('[data-admin-notice="privacy"]')).toContainText("180 days");
  await expect(page.getByRole("alert").filter({
    hasText: "Unable to load the feedback inbox",
  })).toBeVisible();
  await expect(page.getByText("No active feedback cases.")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Recoverable deletions" })).toBeHidden();

  shouldFail = false;
  await page.getByRole("button", { name: "Retry loading feedback" }).click();
  const ledger = feedbackPage.locator('[data-admin-operations-ledger="feedback"]');
  await expect(ledger.locator('[data-admin-signal="new"]')).toContainText("new");
  await expect(ledger).toContainText("The pickup point sign is difficult to find.");
  await expect(ledger).toContainText("09 Aug 2026, 14:30 ICT");
  await expect(ledger).toContainText("Responsible");
  await expect(ledger).toContainText("super");
  await expect(page.getByRole("heading", { name: "Recoverable deletions" })).toBeVisible();
  await expect(page.getByText("Restore until 09 Sep 2026, 07:00 ICT")).toBeVisible();
  await expectMinimumTarget(feedbackPage.locator("[data-admin-resource-action]:visible"));
});

test("T14 Feedback mutation integrity locks one case, retries the exact PATCH, and publishes a receipt", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await useRole(page, "SUPER_ADMIN");

  const firstPatch = deferredFeedbackResponse();
  const retryPatch = deferredFeedbackResponse();
  const refreshResponse = deferredFeedbackResponse();
  const patchBodies: unknown[] = [];
  let patchAttempt = 0;
  let currentStatus: "new" | "acknowledged" = "new";
  let currentInternalNote: string | null = activeCase.internalNote;
  let holdNextRefresh = false;
  let markRefreshStarted: (() => void) | undefined;
  const refreshStarted = new Promise<void>((resolve) => {
    markRefreshStarted = resolve;
  });

  await useFeedbackApi(page, {
    activeResponse: () => {
      const response = {
        status: 200,
        body: [{
          ...activeCase,
          status: currentStatus,
          internalNote: currentInternalNote,
        }, secondaryActiveCase],
      };
      if (!holdNextRefresh) return response;
      holdNextRefresh = false;
      markRefreshStarted?.();
      return refreshResponse.response;
    },
    onPatch: (body) => {
      patchBodies.push(body);
    },
    patchResponse: () => {
      patchAttempt += 1;
      if (patchAttempt === 1) return firstPatch.response;
      if (patchAttempt === 2) return retryPatch.response;
      throw new Error(`Unexpected feedback PATCH attempt ${patchAttempt}`);
    },
  });

  await page.goto("/admin/feedback");
  const feedbackPage = page.locator('[data-admin-resource="feedback"]');
  const ledger = feedbackPage.locator('[data-admin-operations-ledger="feedback"]');
  const recordFor = (id: string) => ledger.locator("article").filter({
    has: page.getByRole("heading", { level: 3, name: id, exact: true }),
  });
  const activeRecord = recordFor(activeCase.id);
  const secondaryRecord = recordFor(secondaryActiveCase.id);
  const note = activeRecord.getByLabel(`Internal note for feedback ${activeCase.id}`);
  const noteText = "  Inspect the stop sign this afternoon.  ";
  const expectedBody = {
    status: "acknowledged",
    internalNote: "Inspect the stop sign this afternoon.",
  };

  await expect(activeRecord).toBeVisible();
  await expect(secondaryRecord).toBeVisible();
  await note.fill(noteText);
  const markAcknowledged = activeRecord.getByRole("button", {
    name: "Mark acknowledged",
    exact: true,
  });
  await markAcknowledged.evaluate((element) => {
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error("Expected the feedback status action to be a button");
    }
    element.click();
    element.click();
  });

  await expect.poll(() => patchBodies.length).toBe(1);
  expect(patchBodies).toEqual([expectedBody]);
  const busyStatusAction = activeRecord.getByRole("button", {
    name: "Marking acknowledged…",
    exact: true,
  });
  await expect(busyStatusAction).toBeDisabled();
  await expect(busyStatusAction).toHaveAttribute("aria-busy", "true");
  await expect(note).toBeDisabled();
  await expect(activeRecord.getByRole("button", { name: "Save note", exact: true })).toBeDisabled();
  await expect(activeRecord.getByRole("button", { name: "Mark duplicate", exact: true })).toBeDisabled();
  await expect(activeRecord.getByRole("button", { name: "Mark rejected", exact: true })).toBeDisabled();
  await expect(activeRecord.getByRole("button", {
    name: `Delete feedback ${activeCase.id}`,
  })).toBeDisabled();
  await expect(secondaryRecord.getByLabel(
    `Internal note for feedback ${secondaryActiveCase.id}`,
  )).toBeEnabled();
  await expect(secondaryRecord.getByRole("button", {
    name: "Mark acknowledged",
    exact: true,
  })).toBeEnabled();
  await expect(feedbackPage.locator('[data-admin-mutation-feedback="success"]')).toHaveCount(0);

  firstPatch.resolve({
    status: 409,
    body: {
      error: "Feedback update was rejected. Try again.",
      debug: { credential: "secret-debug-token" },
    },
  });

  const failure = feedbackPage.locator('[data-admin-mutation-feedback="error"]').filter({
    hasText: "Feedback update was rejected. Try again.",
  });
  await expect(failure).toBeVisible();
  await expect(failure).not.toContainText("secret-debug-token");
  await expect(note).toHaveValue(noteText);
  await expect(activeRecord).toHaveAttribute("data-admin-signal", "new");
  await expect(markAcknowledged).toBeEnabled();
  await expect(activeRecord.getByRole("button", { name: "Save note", exact: true })).toBeEnabled();

  await markAcknowledged.click();
  await expect.poll(() => patchBodies.length).toBe(2);
  expect(patchBodies).toEqual([expectedBody, expectedBody]);
  await expect(busyStatusAction).toBeDisabled();
  await expect(busyStatusAction).toHaveAttribute("aria-busy", "true");

  currentStatus = "acknowledged";
  currentInternalNote = expectedBody.internalNote;
  holdNextRefresh = true;
  retryPatch.resolve({ status: 200, body: { success: true } });
  await refreshStarted;

  const receipt = feedbackPage.locator('[data-admin-mutation-feedback="success"]').filter({
    hasText: activeCase.id,
  });
  await expect(page.getByRole("status").filter({ hasText: "Loading inbox…" })).toBeVisible();
  await expect(receipt).toBeVisible();
  await expect(receipt).toHaveAttribute("role", "status");
  await expect(receipt).toHaveAttribute("aria-live", "polite");
  await expect(failure).toHaveCount(0);

  refreshResponse.resolve({
    status: 200,
    body: [{
      ...activeCase,
      status: currentStatus,
      internalNote: currentInternalNote,
    }, secondaryActiveCase],
  });

  await expect(note).toHaveValue("");
  await expect(activeRecord).toHaveAttribute("data-admin-signal", "acknowledged");
  await expect(activeRecord.getByRole("button", {
    name: "Mark investigating",
    exact: true,
  })).toBeVisible();
  await expect(activeRecord.getByRole("button", {
    name: "Mark acknowledged",
    exact: true,
  })).toHaveCount(0);
  await expect(activeRecord.getByRole("button", {
    name: "Mark duplicate",
    exact: true,
  })).toHaveCount(0);
  await expect(activeRecord.getByRole("button", {
    name: "Mark rejected",
    exact: true,
  })).toHaveCount(0);
  await expect(receipt).toBeVisible();
  expect(patchBodies).toEqual([expectedBody, expectedBody]);
});

test("T14 Feedback Mobile actions and sensitive dialog preserve focus and payloads", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await useRole(page, "SUPER_ADMIN");
  let patchBody: unknown = null;
  let deleteBody: unknown = null;
  let restoreBody: unknown = "not-called";
  await useFeedbackApi(page, {
    onPatch: (body) => { patchBody = body; },
    onDelete: (body) => { deleteBody = body; },
    onRestore: (body) => { restoreBody = body; },
  });
  await page.route(/\/api\/auth\/reauthenticate$/, (route) => fulfillJson(route, {
    token: "header.refreshed.signature",
    user: { id: "t14-super_admin", username: "super_admin", role: "SUPER_ADMIN" },
  }));

  await page.goto("/admin/feedback");
  const feedbackPage = page.locator('[data-admin-resource="feedback"]');
  const note = page.getByLabel(`Internal note for feedback ${activeCase.id}`);
  await note.fill("Inspect the stop sign this afternoon.");
  await page.getByRole("button", { name: "Mark acknowledged" }).click();
  await expect.poll(() => patchBody).toEqual({
    status: "acknowledged",
    internalNote: "Inspect the stop sign this afternoon.",
  });

  const deleteInvoker = page.getByRole("button", { name: `Delete feedback ${activeCase.id}` });
  await deleteInvoker.click();
  const dialog = page.locator('[data-admin-dialog="feedback-confirmation"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await expect(dialog.getByLabel("Deletion reason")).toBeVisible();
  await expect(dialog.getByLabel("Current password")).toHaveAttribute("autocomplete", "current-password");
  await expectGlassPresentation(dialog);
  await expectMinimumTarget(dialog.locator("[data-admin-control]:visible"));

  await dialog.getByLabel("Deletion reason").focus();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Delete" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByLabel("Deletion reason")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(deleteInvoker).toBeFocused();

  await deleteInvoker.click();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();

  await dialog.getByLabel("Deletion reason").selectOption("privacy_request");
  await dialog.getByLabel("Current password").fill("current-password");
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect.poll(() => deleteBody).toEqual({ reason: "privacy_request" });
  await expect(dialog).toBeHidden();

  const restoreInvoker = page.getByRole("button", {
    name: `Restore feedback ${deletedCase.id}`,
  });
  await restoreInvoker.click();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await expect(dialog.getByLabel("Deletion reason")).toBeHidden();
  await dialog.getByLabel("Current password").fill("current-password");
  await dialog.getByRole("button", { name: "Restore" }).click();
  await expect.poll(() => restoreBody).toBeNull();
  await expect(dialog).toBeHidden();

  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  await expectMinimumTarget(feedbackPage.locator("[data-admin-control]:visible"));
});
