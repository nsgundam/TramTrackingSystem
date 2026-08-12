import {
  expect,
  test,
  type BrowserContext,
  type Locator,
  type Page,
  type Route as PlaywrightRoute,
} from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";

const sourceHealth = [
  {
    sourceType: "mobile",
    vehicle: { id: "VH001", name: "Tram 01" },
    freshness: "online",
    lastSeenAt: "2026-08-10T01:30:00.000Z",
    status: "active",
    errorCategory: "none",
  },
  {
    sourceType: "lorawan",
    vehicle: null,
    freshness: "never_seen",
    lastSeenAt: null,
    status: "registered",
    errorCategory: "never_seen",
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
    activeResponse?: () => { status: number; body: unknown };
    onPatch?: (body: unknown) => void;
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
      const response = options.activeResponse?.() ?? { status: 200, body: [activeCase] };
      await fulfillJson(route, response.body, response.status);
      return;
    }
    if (pathname === `/api/admin/feedback/${activeCase.id}` && request.method() === "PATCH") {
      options.onPatch?.(request.postDataJSON());
      await fulfillJson(route, { success: true });
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

test("T14 Source Health uses the semantic operations ledger and only safe fields", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  await useRole(page, "ADMIN");
  await page.route(/\/api\/admin\/devices\/health$/, (route) => fulfillJson(route, sourceHealth));

  await page.goto("/admin/devices");
  const sourcePage = page.locator('[data-admin-resource="source-health"]');
  await expect(sourcePage).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Source Health" })).toBeVisible();
  await expect(sourcePage.locator('[data-admin-notice="read-only"]')).toContainText("Read-only");
  const ledger = sourcePage.locator('[data-admin-operations-ledger="source-health"]');
  await expect(ledger).toBeVisible();
  await expect(ledger.locator('[data-admin-signal="online"]')).toContainText("online");
  const firstRecord = ledger.locator("article").first();
  await expect(firstRecord).toContainText("mobile");
  await expect(firstRecord).toContainText("Tram 01 (VH001)");
  await expect(firstRecord).toContainText("Error category");
  await expect(firstRecord).toContainText("Source status");
  await expect(firstRecord).not.toContainText(/credential|payload|location|IP address/i);
  await expectSolidPresentation(sourcePage.locator("[data-admin-resource-panel]"));
  await expectMinimumTarget(sourcePage.locator("[data-admin-resource-action]:visible"));
});

test("T14 Source Health initial failure is distinct from empty and retryable on Mobile", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await useRole(page, "ADMIN");
  let shouldFail = true;
  await page.route(/\/api\/admin\/devices\/health$/, (route) => (
    shouldFail
      ? fulfillJson(route, { error: "Temporarily unavailable" }, 503)
      : fulfillJson(route, [])
  ));

  await page.goto("/admin/devices");
  await expect(page.getByRole("alert").filter({
    hasText: "Unable to load the safe source-health view",
  })).toBeVisible();
  await expect(page.getByText("No sources are registered.")).toBeHidden();
  shouldFail = false;
  await page.getByRole("button", { name: "Retry loading source health" }).click();
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
  await expect(ledger).toContainText("Responsible");
  await expect(ledger).toContainText("super");
  await expect(page.getByRole("heading", { name: "Recoverable deletions" })).toBeVisible();
  await expectMinimumTarget(feedbackPage.locator("[data-admin-resource-action]:visible"));
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
