import assert from "node:assert/strict";
import test from "node:test";
import { formatAdminTimestamp } from "../utils/admin-timestamp";

test("Admin timestamps use ICT and the en-GB 24-hour operations format", () => {
  const expected = "15 Aug 2026, 14:30 ICT";

  assert.equal(formatAdminTimestamp("2026-08-15T07:30:45.000Z"), expected);
  assert.equal(formatAdminTimestamp(new Date("2026-08-15T07:30:45.000Z")), expected);
  assert.equal(formatAdminTimestamp(Date.parse("2026-08-15T07:30:45.000Z")), expected);
  assert.equal(formatAdminTimestamp("2026-09-09T00:00:00.000Z"), "09 Sep 2026, 07:00 ICT");
});

test("Admin timestamps fail closed for absent or invalid values", () => {
  assert.equal(formatAdminTimestamp(null), null);
  assert.equal(formatAdminTimestamp(undefined), null);
  assert.equal(formatAdminTimestamp("not-a-timestamp"), null);
  assert.equal(formatAdminTimestamp(new Date("not-a-timestamp")), null);
});
