import assert from "node:assert/strict";

const {
  adminRoleCliUsage,
  parseAdminRoleAssignmentArgs,
} = await import("../dist/scripts/admin-role-cli.js");

assert.deepEqual(
  parseAdminRoleAssignmentArgs(["--username", "ops.owner", "--role", "SUPER_ADMIN"]),
  { username: "ops.owner", role: "SUPER_ADMIN", apply: false },
);
assert.deepEqual(
  parseAdminRoleAssignmentArgs(["--role", "DEV", "--apply", "--username", "developer.one"]),
  { username: "developer.one", role: "DEV", apply: true },
);
assert.throws(
  () => parseAdminRoleAssignmentArgs(["--username", "admin", "--role", "OWNER"]),
  /Invalid role/,
);
assert.throws(
  () => parseAdminRoleAssignmentArgs(["--username", "admin"]),
  /Missing --role/,
);
assert.throws(
  () => parseAdminRoleAssignmentArgs(["--username", "admin", "--role", "ADMIN", "--force"]),
  /Unknown command option/,
);
assert.throws(
  () => parseAdminRoleAssignmentArgs(["--username", "admin", "--username", "another", "--role", "ADMIN"]),
  /Duplicate argument: --username/,
);
assert.match(adminRoleCliUsage(), /read-only dry run unless --apply/);

console.log("Admin role CLI argument boundary tests passed.");
