import assert from "node:assert/strict";
import test from "node:test";
import {
  toStartOfDayIso,
  toEndOfDayIso,
  validateDateRange,
} from "../utils/history-filters.ts";

test("toStartOfDayIso converts YYYY-MM-DD to Asia/Bangkok 00:00 ICT in UTC ISO", () => {
  assert.equal(toStartOfDayIso("2026-08-01"), "2026-07-31T17:00:00.000Z");
  assert.equal(toStartOfDayIso("2026-08-24"), "2026-08-23T17:00:00.000Z");
  assert.equal(toStartOfDayIso(""), undefined);
  assert.equal(toStartOfDayIso("   "), undefined);
  assert.equal(toStartOfDayIso("2026-08-01T12:00:00.000Z"), "2026-08-01T12:00:00.000Z");
});

test("toEndOfDayIso converts YYYY-MM-DD to Asia/Bangkok 23:59:59.999 ICT in UTC ISO", () => {
  assert.equal(toEndOfDayIso("2026-08-01"), "2026-08-01T16:59:59.999Z");
  assert.equal(toEndOfDayIso("2026-08-24"), "2026-08-24T16:59:59.999Z");
  assert.equal(toEndOfDayIso(""), undefined);
  assert.equal(toEndOfDayIso("   "), undefined);
});

test("validateDateRange rejects start date after end date", () => {
  assert.equal(validateDateRange("2026-08-01", "2026-08-24"), null);
  assert.equal(validateDateRange("2026-08-24", "2026-08-24"), null);
  assert.equal(validateDateRange("2026-08-25", "2026-08-24"), "Start date must be on or before end date.");
  assert.equal(validateDateRange("", "2026-08-24"), null);
  assert.equal(validateDateRange("2026-08-01", ""), null);
  assert.equal(validateDateRange("invalid-date", "2026-08-24"), "Invalid date format.");
});
