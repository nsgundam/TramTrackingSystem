import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type BrowserContext, type Locator, type Page, type Route } from "@playwright/test";

const ADMIN_ORIGIN = "http://127.0.0.1:13000";

const routes = [
  { id: "R01", name: "Campus Loop", color: "#075DC7", status: "active" },
];

const vehicles = [
  {
    id: "VH001",
    name: "Tram 01",
    type: "Tram",
    status: "active",
    assignedRouteId: "R01",
    route: routes[0],
  },
];

const stops = [
  {
    id: "ST01",
    nameTh: "ประตูหลัก",
    nameEn: "Main Gate",
    lat: 13.9641,
    lng: 100.5867,
    status: "active",
  },
  {
    id: "ST02",
    nameTh: "อาคารเรียน",
    nameEn: "Learning Center",
    lat: 13.9652,
    lng: 100.5878,
    status: "active",
  },
];

type MasterDataResource = "vehicles" | "routes" | "stops";

interface MutationRequest {
  resource: MasterDataResource;
  method: "POST" | "PUT" | "DELETE";
  pathname: string;
  id: string | null;
  body: unknown | null;
}

interface MutationResponse {
  status?: number;
  body?: unknown;
}

type MutationHandler = (
  request: MutationRequest,
) => MutationResponse | Promise<MutationResponse>;

interface MasterDataScenario {
  resource: MasterDataResource;
  singular: "vehicle" | "route" | "stop";
  path: string;
  itemId: string;
  itemName: string;
  addLabel: string;
  editLabel: string;
  deleteLabel: string;
  closeLabel: string;
  createSubmitLabel: string;
  createName: string;
  createBody: Record<string, unknown>;
  updatedName: string;
  updateBody: Record<string, unknown>;
  failureText: string;
  fillCreate: (dialog: Locator) => Promise<void>;
  fillUpdate: (dialog: Locator) => Promise<void>;
  expectRetainedUpdate: (dialog: Locator) => Promise<void>;
}

const isMasterDataResource = (value: string): value is MasterDataResource => (
  value === "vehicles" || value === "routes" || value === "stops"
);

const responseData: Record<MasterDataResource, unknown> = {
  vehicles,
  routes,
  stops,
};

const scenarios: readonly MasterDataScenario[] = [
  {
    resource: "vehicles",
    singular: "vehicle",
    path: "/admin/vehicles",
    itemId: "VH001",
    itemName: "Tram 01",
    addLabel: "Add Vehicle",
    editLabel: "Edit Tram 01",
    deleteLabel: "Delete Tram 01",
    closeLabel: "Close vehicle dialog",
    createSubmitLabel: "Create Vehicle",
    createName: "Shuttle 02",
    createBody: {
      id: "VH002",
      name: "Shuttle 02",
      type: "Bus",
      status: "inactive",
      assignedRouteId: "R01",
    },
    updatedName: "Tram 01 Updated",
    updateBody: {
      id: "VH001",
      name: "Tram 01 Updated",
      type: "Electric Tram",
      status: "maintenance",
      assignedRouteId: "",
    },
    failureText: "Vehicle could not be saved. Try again.",
    fillCreate: async (dialog) => {
      await dialog.getByLabel("Vehicle ID").fill("VH002");
      await dialog.getByLabel("Vehicle Name").fill("Shuttle 02");
      await dialog.getByLabel("Type").fill("Bus");
      await dialog.getByLabel("Status").selectOption("inactive");
      await dialog.getByLabel("Assign Route").selectOption("R01");
    },
    fillUpdate: async (dialog) => {
      await dialog.getByLabel("Vehicle Name").fill("Tram 01 Updated");
      await dialog.getByLabel("Type").fill("Electric Tram");
      await dialog.getByLabel("Status").selectOption("maintenance");
      await dialog.getByLabel("Assign Route").selectOption("");
    },
    expectRetainedUpdate: async (dialog) => {
      await expect(dialog.getByLabel("Vehicle ID")).toHaveValue("VH001");
      await expect(dialog.getByLabel("Vehicle Name")).toHaveValue("Tram 01 Updated");
      await expect(dialog.getByLabel("Type")).toHaveValue("Electric Tram");
    },
  },
  {
    resource: "routes",
    singular: "route",
    path: "/admin/routes",
    itemId: "R01",
    itemName: "Campus Loop",
    addLabel: "Add Route",
    editLabel: "Edit Campus Loop",
    deleteLabel: "Delete Campus Loop",
    closeLabel: "Close route dialog",
    createSubmitLabel: "Create Route",
    createName: "Library Loop",
    createBody: {
      id: "R02",
      name: "Library Loop",
      color: "#aabbcc",
      status: "inactive",
    },
    updatedName: "Campus Loop Updated",
    updateBody: {
      id: "R01",
      name: "Campus Loop Updated",
      color: "#123456",
      status: "inactive",
    },
    failureText: "Route could not be saved. Try again.",
    fillCreate: async (dialog) => {
      await dialog.getByLabel("Route ID").fill("R02");
      await dialog.getByLabel("Route Name").fill("Library Loop");
      await dialog.getByLabel("Route Color").fill("#aabbcc");
      await dialog.getByLabel("Status").selectOption("inactive");
    },
    fillUpdate: async (dialog) => {
      await dialog.getByLabel("Route Name").fill("Campus Loop Updated");
      await dialog.getByLabel("Route Color").fill("#123456");
      await dialog.getByLabel("Status").selectOption("inactive");
    },
    expectRetainedUpdate: async (dialog) => {
      await expect(dialog.getByLabel("Route ID")).toHaveValue("R01");
      await expect(dialog.getByLabel("Route Name")).toHaveValue("Campus Loop Updated");
      await expect(dialog.getByLabel("Route Color")).toHaveValue("#123456");
    },
  },
  {
    resource: "stops",
    singular: "stop",
    path: "/admin/stops",
    itemId: "ST01",
    itemName: "Main Gate",
    addLabel: "Add Stop",
    editLabel: "Edit Main Gate",
    deleteLabel: "Delete Main Gate",
    closeLabel: "Close stop dialog",
    createSubmitLabel: "Create Stop",
    createName: "Library",
    createBody: {
      id: "ST03",
      nameTh: "หอสมุด",
      nameEn: "Library",
      lat: 13.9661,
      lng: 100.5882,
      imageUrl: "",
    },
    updatedName: "Main Gate Updated",
    updateBody: {
      id: "ST01",
      nameTh: "ประตูหลักปรับปรุง",
      nameEn: "Main Gate Updated",
      lat: 13.9642,
      lng: 100.5868,
      imageUrl: "",
    },
    failureText: "Stop could not be saved. Try again.",
    fillCreate: async (dialog) => {
      await dialog.getByLabel("Stop ID").fill("ST03");
      await dialog.getByLabel("Name (TH)").fill("หอสมุด");
      await dialog.getByLabel("Name (EN)").fill("Library");
      await dialog.getByLabel("Latitude").fill("13.9661");
      await dialog.getByLabel("Longitude").fill("100.5882");
    },
    fillUpdate: async (dialog) => {
      await dialog.getByLabel("Name (TH)").fill("ประตูหลักปรับปรุง");
      await dialog.getByLabel("Name (EN)").fill("Main Gate Updated");
      await dialog.getByLabel("Latitude").fill("13.9642");
      await dialog.getByLabel("Longitude").fill("100.5868");
    },
    expectRetainedUpdate: async (dialog) => {
      await expect(dialog.getByLabel("Stop ID")).toHaveValue("ST01");
      await expect(dialog.getByLabel("Name (TH)")).toHaveValue("ประตูหลักปรับปรุง");
      await expect(dialog.getByLabel("Name (EN)")).toHaveValue("Main Gate Updated");
    },
  },
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

const fulfillJson = async (route: Route, body: unknown, status = 200) => {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
};

const useMasterData = async (
  page: Page,
  options: {
    vehiclesResponse?: () => { status: number; body: unknown };
    stopsResponse?: () => { status: number; body: unknown };
    onRouteStopsPut?: (body: unknown) => MutationResponse | Promise<MutationResponse>;
    onMutation?: MutationHandler;
  } = {},
) => {
  await page.route("**/api/admin/**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/admin/route-stops/R01") {
      if (request.method() === "PUT") {
        const response = await options.onRouteStopsPut?.(request.postDataJSON())
          ?? { status: 200, body: { success: true } };
        await fulfillJson(route, response.body ?? { success: true }, response.status ?? 200);
        return;
      }
      await fulfillJson(route, stops.map((stop, index) => ({ ...stop, stopOrder: index + 1 })));
      return;
    }

    const match = pathname.match(/^\/api\/admin\/(vehicles|routes|stops)(?:\/([^/]+))?$/);
    if (!match || !isMasterDataResource(match[1])) {
      await fulfillJson(route, { success: true });
      return;
    }

    const resource = match[1];
    if (request.method() === "GET") {
      const response = resource === "vehicles"
        ? options.vehiclesResponse?.() ?? { status: 200, body: responseData[resource] }
        : resource === "stops"
          ? options.stopsResponse?.() ?? { status: 200, body: responseData[resource] }
          : { status: 200, body: responseData[resource] };
      await fulfillJson(route, response.body, response.status);
      return;
    }

    const method = request.method();
    if (method !== "POST" && method !== "PUT" && method !== "DELETE") {
      await fulfillJson(route, { error: "Unsupported test request" }, 405);
      return;
    }
    const postData = request.postData();
    const response = await options.onMutation?.({
      resource,
      method,
      pathname,
      id: match[2] ? decodeURIComponent(match[2]) : null,
      body: postData === null ? null : request.postDataJSON(),
    }) ?? { status: 200, body: { success: true } };
    await fulfillJson(route, response.body ?? { success: true }, response.status ?? 200);
  });
};

const deferredMutation = () => {
  let settle: ((response: MutationResponse) => void) | undefined;
  const response = new Promise<MutationResponse>((resolve) => {
    settle = resolve;
  });
  return {
    response,
    resolve(value: MutationResponse = { status: 200, body: { success: true } }) {
      if (!settle) throw new Error("Mutation response was not initialized");
      settle(value);
    },
  };
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

const mutationReceipt = (
  page: Page,
  action: "created" | "updated" | "deleted",
  target: string,
) => page.getByRole("status").filter({ hasText: target }).filter({
  hasText: action === "created"
    ? /created|added/i
    : action === "updated"
      ? /updated|saved/i
      : /deleted|removed/i,
});

test("T14 Admin master-data mutation source guard rejects native dialogs and caught-error logging", () => {
  const workingDirectory = process.cwd();
  const webRoot = workingDirectory.endsWith("shuttle-tracking-web")
    ? workingDirectory
    : join(workingDirectory, "shuttle-tracking-web");
  const pageSources = [
    "app/admin/vehicles/page.tsx",
    "app/admin/routes/page.tsx",
    "app/admin/stops/page.tsx",
  ] as const;

  for (const relativePath of pageSources) {
    const source = readFileSync(join(webRoot, relativePath), "utf8");
    expect(source, `${relativePath} must not call a native alert or confirmation`).not.toMatch(
      /\b(?:window\s*\.\s*)?(?:alert|confirm)\s*\(/,
    );
    expect(source, `${relativePath} must not log caught error objects`).not.toMatch(
      /\bconsole\s*\.\s*(?:error|warn|log)\s*\(/,
    );
  }
});

test("T14 Admin master-data mutation create and update retain exact bodies, inline recovery, pending lock, and receipts", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  const nativeDialogs: string[] = [];
  page.on("dialog", (dialog) => {
    nativeDialogs.push(dialog.type());
    void dialog.dismiss();
  });

  let handleMutation: MutationHandler = () => ({ status: 200, body: { success: true } });
  await useMasterData(page, {
    onMutation: (request) => handleMutation(request),
  });

  for (const scenario of scenarios) {
    const createGate = deferredMutation();
    const updateGate = deferredMutation();
    const createRequests: MutationRequest[] = [];
    const updateRequests: MutationRequest[] = [];
    handleMutation = (request) => {
      if (request.resource !== scenario.resource) {
        throw new Error(`Unexpected ${request.resource} mutation while testing ${scenario.resource}`);
      }
      if (request.method === "POST") {
        createRequests.push(request);
        return createGate.response;
      }
      if (request.method === "PUT") {
        updateRequests.push(request);
        if (updateRequests.length === 1) {
          return {
            status: 422,
            body: {
              error: scenario.failureText,
              debug: { credential: "secret-debug-token" },
            },
          };
        }
        return updateGate.response;
      }
      throw new Error(`Unexpected ${request.method} mutation while testing save behavior`);
    };

    await page.goto(scenario.path);
    await page.getByRole("button", { name: scenario.addLabel }).click();
    let dialog = page.locator('[data-admin-dialog="form"]');
    await expect(dialog).toBeVisible();
    await scenario.fillCreate(dialog);
    let submitButton = dialog.locator('button[type="submit"]');
    await expect(submitButton).toHaveAccessibleName(scenario.createSubmitLabel);
    await submitButton.click();

    await expect.poll(() => createRequests.length).toBe(1);
    expect(createRequests).toEqual([{
      resource: scenario.resource,
      method: "POST",
      pathname: `/api/admin/${scenario.resource}`,
      id: null,
      body: scenario.createBody,
    }]);
    await expect(submitButton).toBeDisabled();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await expect(dialog.getByRole("button", { name: scenario.closeLabel })).toBeDisabled();
    await expect(mutationReceipt(page, "created", scenario.createName)).toHaveCount(0);
    await submitButton.click({ force: true });
    expect(createRequests).toHaveLength(1);

    createGate.resolve();
    await expect(dialog).toBeHidden();
    const createReceipt = mutationReceipt(page, "created", scenario.createName);
    await expect(createReceipt).toBeVisible();
    await expectSolidPresentation(createReceipt);

    await page.getByRole("button", { name: scenario.editLabel }).click();
    dialog = page.locator('[data-admin-dialog="form"]');
    await expect(dialog).toBeVisible();
    await scenario.fillUpdate(dialog);
    submitButton = dialog.locator('button[type="submit"]');
    await expect(submitButton).toHaveAccessibleName("Save Changes");
    await submitButton.click();

    const failure = dialog.getByRole("alert").filter({ hasText: scenario.failureText });
    await expect(failure).toBeVisible();
    await expect(failure).not.toContainText("secret-debug-token");
    await expectSolidPresentation(failure);
    await scenario.expectRetainedUpdate(dialog);
    expect(updateRequests).toEqual([{
      resource: scenario.resource,
      method: "PUT",
      pathname: `/api/admin/${scenario.resource}/${scenario.itemId}`,
      id: scenario.itemId,
      body: scenario.updateBody,
    }]);

    await submitButton.click();
    await expect.poll(() => updateRequests.length).toBe(2);
    expect(updateRequests[1]).toEqual(updateRequests[0]);
    await expect(submitButton).toBeDisabled();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await expect(dialog.getByRole("button", { name: scenario.closeLabel })).toBeDisabled();
    await expect(mutationReceipt(page, "updated", scenario.updatedName)).toHaveCount(0);
    await submitButton.click({ force: true });
    expect(updateRequests).toHaveLength(2);

    updateGate.resolve();
    await expect(dialog).toBeHidden();
    const updateReceipt = mutationReceipt(page, "updated", scenario.updatedName);
    await expect(updateReceipt).toBeVisible();
    await expectSolidPresentation(updateReceipt);
  }

  expect(nativeDialogs).toEqual([]);
});

test("T14 Admin master-data mutation shared delete dialog cancels, restores focus, retries safely, and sends exact DELETE", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  const nativeDialogs: string[] = [];
  page.on("dialog", (dialog) => {
    nativeDialogs.push(dialog.type());
    void dialog.dismiss();
  });

  let handleMutation: MutationHandler = () => ({ status: 200, body: { success: true } });
  await useMasterData(page, {
    onMutation: (request) => handleMutation(request),
  });

  for (const scenario of scenarios) {
    const retryGate = deferredMutation();
    const deleteRequests: MutationRequest[] = [];
    const failureText = `${scenario.itemName} cannot be deleted while it is in use.`;
    handleMutation = (request) => {
      if (request.resource !== scenario.resource || request.method !== "DELETE") {
        throw new Error(`Unexpected mutation while testing ${scenario.resource} deletion`);
      }
      deleteRequests.push(request);
      if (deleteRequests.length === 1) {
        return {
          status: 409,
          body: {
            error: failureText,
            debug: { credential: "secret-delete-token" },
          },
        };
      }
      return retryGate.response;
    };

    await page.goto(scenario.path);
    const deleteInvoker = page.getByRole("button", { name: scenario.deleteLabel });
    const dialog = page.locator('[data-admin-dialog="mutation-confirmation"]');

    await deleteInvoker.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /delete/i })).toBeVisible();
    await expect(dialog).toContainText(scenario.itemName);
    await expect(dialog).toContainText(scenario.itemId);
    await expect(dialog).toHaveAccessibleDescription(
      `Confirm deletion of ${scenario.singular} ${scenario.itemName} (ID ${scenario.itemId}) before this request is sent.`,
    );
    const cancelButton = dialog.getByRole("button", { name: "Cancel" });
    await expect(cancelButton).toBeFocused();
    await cancelButton.click();
    await expect(dialog).toBeHidden();
    await expect(deleteInvoker).toBeFocused();
    expect(deleteRequests).toEqual([]);

    await deleteInvoker.click();
    await expect(cancelButton).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(deleteInvoker).toBeFocused();
    expect(deleteRequests).toEqual([]);

    await deleteInvoker.click();
    await expect(cancelButton).toBeFocused();
    const deleteButton = dialog.locator('button[data-tone="danger"]');
    await expect(deleteButton).toHaveAccessibleName("Delete");
    await deleteButton.click();

    const failure = dialog.getByRole("alert").filter({ hasText: failureText });
    await expect(failure).toBeVisible();
    await expect(failure).not.toContainText("secret-delete-token");
    await expectSolidPresentation(failure);
    expect(deleteRequests).toEqual([{
      resource: scenario.resource,
      method: "DELETE",
      pathname: `/api/admin/${scenario.resource}/${scenario.itemId}`,
      id: scenario.itemId,
      body: null,
    }]);

    await deleteButton.click();
    await expect.poll(() => deleteRequests.length).toBe(2);
    expect(deleteRequests[1]).toEqual(deleteRequests[0]);
    await expect(deleteButton).toBeDisabled();
    await expect(cancelButton).toBeDisabled();
    await expect(mutationReceipt(page, "deleted", scenario.itemName)).toHaveCount(0);
    await deleteButton.click({ force: true });
    expect(deleteRequests).toHaveLength(2);

    retryGate.resolve();
    await expect(dialog).toBeHidden();
    const deleteReceipt = mutationReceipt(page, "deleted", scenario.itemName);
    await expect(deleteReceipt).toBeVisible();
    await expectSolidPresentation(deleteReceipt);
  }

  expect(nativeDialogs).toEqual([]);
});

test("T14 Admin master-data mutation Mobile forms and shared confirmations keep 44 px controls without overflow", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await useMasterData(page);
  const nativeDialogs: string[] = [];
  page.on("dialog", (dialog) => {
    nativeDialogs.push(dialog.type());
    void dialog.dismiss();
  });

  for (const scenario of scenarios) {
    await page.goto(scenario.path);
    const resourcePage = page.locator(`[data-admin-resource="${scenario.resource}"]`);
    await expectMinimumTarget(resourcePage.locator("[data-admin-resource-action]:visible"));

    const editInvoker = page.getByRole("button", { name: scenario.editLabel });
    await editInvoker.click();
    const formDialog = page.locator('[data-admin-dialog="form"]');
    await expect(formDialog).toBeVisible();
    await expectMinimumTarget(formDialog.locator("[data-admin-control]:visible"));
    let overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
    await page.keyboard.press("Escape");
    await expect(formDialog).toBeHidden();
    await expect(editInvoker).toBeFocused();

    const deleteInvoker = page.getByRole("button", { name: scenario.deleteLabel });
    await deleteInvoker.click();
    const deleteDialog = page.locator('[data-admin-dialog="mutation-confirmation"]');
    await expect(deleteDialog).toBeVisible();
    await expect(deleteDialog).toContainText(scenario.itemName);
    await expectGlassPresentation(deleteDialog);
    await expectMinimumTarget(deleteDialog.locator("[data-admin-control]:visible"));
    overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
    const dialogOverflow = await deleteDialog.evaluate((element) => ({
      visible: element.clientWidth,
      content: element.scrollWidth,
    }));
    expect(dialogOverflow.content).toBeLessThanOrEqual(dialogOverflow.visible);
    await page.keyboard.press("Escape");
    await expect(deleteDialog).toBeHidden();
    await expect(deleteInvoker).toBeFocused();
  }

  expect(nativeDialogs).toEqual([]);
});

test("T14 Admin master-data pages share the semantic desktop hierarchy and named actions", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  await useMasterData(page);

  const pages = [
    { path: "/admin/vehicles", resource: "vehicles", heading: "Vehicles Management" },
    { path: "/admin/routes", resource: "routes", heading: "Routes Management" },
    { path: "/admin/stops", resource: "stops", heading: "Stops Management" },
  ] as const;

  for (const expected of pages) {
    await page.goto(expected.path);
    const resourcePage = page.locator(`[data-admin-resource="${expected.resource}"]`);
    await expect(resourcePage).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: expected.heading })).toBeVisible();
    await expect(resourcePage.locator('[data-admin-view="table"]')).toBeVisible();
    await expect(resourcePage.locator('[data-admin-view="cards"]')).toBeHidden();

    const presentation = await resourcePage.locator("[data-admin-resource-panel]").evaluate((element) => {
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
    await expectMinimumTarget(resourcePage.locator("[data-admin-resource-action]:visible"));
  }

  await expect(page.getByRole("button", { name: "Edit Main Gate" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Main Gate" })).toBeVisible();
});

test("T14 Admin vehicle load failure is inline, distinct from empty, and retryable", async ({ page, context }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticateAdmin(context);
  let shouldFail = true;
  await useMasterData(page, {
    vehiclesResponse: () => shouldFail
      ? { status: 503, body: { error: "Temporarily unavailable" } }
      : { status: 200, body: vehicles },
  });
  page.on("dialog", (dialog) => dialog.dismiss());

  await page.goto("/admin/vehicles");
  const resourceAlert = page.locator(".admin-resource-state--error");
  await expect(resourceAlert).toContainText("Unable to load vehicles");
  await expect(page.getByText("No vehicles found.")).toBeHidden();

  shouldFail = false;
  await page.getByRole("button", { name: "Retry loading vehicles" }).click();
  await expect(
    page.locator('[data-admin-view="table"]').getByText("Tram 01", { exact: true }),
  ).toBeVisible();
  await expect(resourceAlert).toBeHidden();
});

test("T14 Admin Mobile cards and CRUD dialog keep data, focus, and 44 px controls", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  await useMasterData(page);

  await page.goto("/admin/routes");
  const resourcePage = page.locator('[data-admin-resource="routes"]');
  await expect(resourcePage.locator('[data-admin-view="cards"]')).toBeVisible();
  await expect(resourcePage.locator('[data-admin-view="table"]')).toBeHidden();
  await expect(resourcePage).toContainText("Campus Loop");
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);

  const editButton = page.getByRole("button", { name: "Edit Campus Loop" });
  await expectMinimumTarget(editButton);
  await editButton.click();
  const dialog = page.locator('[data-admin-dialog="form"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Edit Route" })).toBeVisible();
  await expect(dialog.getByLabel("Route Name")).toHaveValue("Campus Loop");
  await expect(dialog.getByRole("button", { name: "Close route dialog" })).toBeFocused();

  const dialogPresentation = await dialog.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      backdropFilter: styles.backdropFilter,
      transform: styles.transform,
    };
  });
  expect(dialogPresentation).toMatchObject({
    backgroundImage: "none",
    transform: "none",
  });
  expect(dialogPresentation.backdropFilter).toContain("blur(");
  await expectMinimumTarget(dialog.locator("[data-admin-control]:visible"));

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(editButton).toBeFocused();
});

test("T14 route-stop mutation integrity keeps one exact publish retry and names pending and completion", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticateAdmin(context);
  const failureGate = deferredMutation();
  const successGate = deferredMutation();
  let activeGate = failureGate;
  const publishedBodies: unknown[] = [];
  const availableStop = {
    id: "ST03",
    nameTh: "หอสมุด",
    nameEn: "Library",
    lat: 13.9661,
    lng: 100.5882,
    status: "active",
  };
  await useMasterData(page, {
    stopsResponse: () => ({ status: 200, body: [...stops, availableStop] }),
    onRouteStopsPut: (body) => {
      publishedBodies.push(body);
      return activeGate.response;
    },
  });

  await page.goto("/admin/routes");
  const manageStops = page.getByRole("button", { name: "Manage stops for Campus Loop" });
  await manageStops.click();
  const dialog = page.locator('[data-admin-dialog="route-stops"]');
  await expect(dialog).toBeVisible();
  const closeButton = dialog.getByRole("button", { name: "Close route stops manager" });
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(manageStops).toBeFocused();
  expect(publishedBodies).toEqual([]);

  await manageStops.click();
  await expect(dialog).toBeVisible();
  const order = dialog.getByLabel("Published stop order");
  const orderItems = order.getByRole("listitem");
  await expect(orderItems).toHaveCount(2);
  await expectMinimumTarget(dialog.locator("[data-admin-control]:visible"));
  let overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
  const dialogOverflow = await dialog.evaluate((element) => ({
    visible: element.clientWidth,
    content: element.scrollWidth,
  }));
  expect(dialogOverflow.content).toBeLessThanOrEqual(dialogOverflow.visible);

  await dialog.getByRole("button", { name: "Move ประตูหลัก down" }).click();
  await expect(orderItems.nth(0)).toContainText("อาคารเรียน");
  await expect(orderItems.nth(1)).toContainText("ประตูหลัก");

  const stopSelection = dialog.getByLabel("Add active stop");
  const addButton = dialog.getByRole("button", { name: "Add", exact: true });
  await stopSelection.selectOption("ST03");
  await expect(stopSelection).toBeEnabled();
  await expect(addButton).toBeEnabled();

  const publishButton = dialog.getByRole("button", { name: /(?:Publish|Publishing) order/ });
  const completionReceipt = page
    .getByRole("status")
    .filter({ hasText: "Campus Loop" })
    .filter({ hasText: "R01" });
  const softExpect = expect.configure({ soft: true, timeout: 1_000 });

  await publishButton.evaluate((element) => {
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error("Publish order control must be a button");
    }
    element.click();
    element.click();
  });

  await softExpect.poll(() => publishedBodies.length).toBe(1);
  softExpect(publishedBodies).toEqual([{ stopIds: ["ST02", "ST01"] }]);
  await softExpect(publishButton).toHaveAttribute("aria-busy", "true");
  await softExpect(publishButton).toHaveAccessibleName(/Publishing.*order/i);
  await softExpect.poll(
    () => dialog.locator("[data-admin-control]:not(:disabled)").count(),
  ).toBe(0);
  await softExpect(completionReceipt).toHaveCount(0);

  await closeButton.evaluate((element) => {
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error("Close route stops manager control must be a button");
    }
    element.click();
  });
  await softExpect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await softExpect(dialog).toBeVisible();
  await softExpect.poll(() => publishedBodies.length).toBe(1);

  failureGate.resolve({
    status: 503,
    body: {
      details: "Internal route publication failure",
      debug: { credential: "secret-route-order-token" },
    },
  });

  const failure = dialog.getByRole("alert").filter({
    hasText: "Unable to publish route stops. Try again.",
  });
  await expect(failure).toBeVisible();
  await expect(failure).not.toContainText("secret-route-order-token");
  await expect(failure).not.toContainText("Internal route publication failure");
  await expect(orderItems.nth(0)).toContainText("อาคารเรียน");
  await expect(orderItems.nth(1)).toContainText("ประตูหลัก");
  await expect(publishButton).toBeEnabled();
  await expect(publishButton).toHaveAccessibleName(/(?:Publish|Retry).*order/i);

  activeGate = successGate;
  await publishButton.click();
  await softExpect.poll(() => publishedBodies.length).toBe(2);
  softExpect(publishedBodies.at(-1)).toEqual({ stopIds: ["ST02", "ST01"] });
  await softExpect(publishButton).toHaveAttribute("aria-busy", "true");
  await softExpect(publishButton).toHaveAccessibleName(/Publishing.*order/i);
  await softExpect(completionReceipt).toHaveCount(0);

  successGate.resolve();
  await expect(dialog).toBeHidden();
  await softExpect(completionReceipt).toBeVisible();
  await softExpect(completionReceipt).toHaveAttribute("aria-live", "polite");
  await softExpect(completionReceipt).toHaveAttribute("data-admin-mutation-feedback", "success");
  await softExpect(completionReceipt).toContainText(/(?:route.*(?:order|stops)|(?:order|stops).*route)/i);
  await softExpect(manageStops).toBeFocused();

  overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  softExpect(overflow.document).toBeLessThanOrEqual(overflow.viewport);
});
