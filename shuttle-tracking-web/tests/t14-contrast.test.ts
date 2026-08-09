import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  contrastRatio,
  normalizeHexColor,
  readableForegroundFor,
  routeColorStyle,
} from "../utils/colorContrast";

const LIGHT_SURFACE_FILES = [
  "app/admin/dashboard/page.tsx",
  "app/admin/devices/page.tsx",
  "app/admin/feedback/page.tsx",
  "app/admin/routes/page.tsx",
  "app/admin/stops/page.tsx",
  "app/admin/vehicles/page.tsx",
  "components/admin/RouteModal.tsx",
  "components/admin/RouteStopsModal.tsx",
  "components/admin/StopModal.tsx",
  "components/admin/VehicleModal.tsx",
  "components/public/AppTour.tsx",
  "components/public/FeedbackModal.tsx",
] as const;

test("normalizes supported route colors and rejects untrusted display values", () => {
  assert.equal(normalizeHexColor("#AbC"), "#AABBCC");
  assert.equal(normalizeHexColor("#1e3A8a"), "#1E3A8A");
  assert.equal(normalizeHexColor("transparent"), "#3B82F6");
  assert.equal(normalizeHexColor(null), "#3B82F6");
  assert.equal(normalizeHexColor({ color: "#fff" }), "#3B82F6");
});

test("computes WCAG contrast and selects a readable foreground", () => {
  assert.equal(contrastRatio("#000000", "#FFFFFF"), 21);
  assert.equal(readableForegroundFor("#FDE047"), "#000000");
  assert.equal(readableForegroundFor("#1E3A8A"), "#FFFFFF");
  assert.equal(readableForegroundFor("#3B82F6"), "#000000");
});

test("every supported or fallback route badge meets small-text AA", () => {
  for (const routeColor of ["#FDE047", "#3B82F6", "#1E3A8A", "#777", "invalid", undefined]) {
    const style = routeColorStyle(routeColor);
    assert.ok(
      contrastRatio(style.color, style.backgroundColor) >= 4.5,
      `${String(routeColor)} produced ${style.color} on ${style.backgroundColor}`,
    );
  }
});

test("audited light surfaces do not use unqualified 400-level foregrounds", () => {
  const violations = LIGHT_SURFACE_FILES.flatMap((relativePath) => {
    const source = readFileSync(join(process.cwd(), relativePath), "utf8");
    return Array.from(source.matchAll(/(?<!disabled:)text-(?:slate|gray)-400/g), (match) => (
      `${relativePath}:${source.slice(0, match.index).split("\n").length}`
    ));
  });

  assert.deepEqual(violations, []);
});
