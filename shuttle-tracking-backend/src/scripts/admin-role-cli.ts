import { ADMIN_ROLES, isAdminRole, type AdminRole } from "../services/admin-role.service.js";

export interface AdminRoleAssignmentRequest {
  username: string;
  role: AdminRole;
  apply: boolean;
}

export class AdminRoleCliUsageError extends Error {}

export const adminRoleCliUsage = (): string => [
  "Usage:",
  "  npm run admin:set-role -- --username <username> --role <ADMIN|SUPER_ADMIN|DEV> [--apply]",
  "",
  "The command is a read-only dry run unless --apply is present.",
].join("\n");

const requiredArgument = (value: string | undefined, name: string): string => {
  const normalized = value?.trim();
  if (!normalized) throw new AdminRoleCliUsageError(`Missing ${name}\n\n${adminRoleCliUsage()}`);
  return normalized;
};

export const parseAdminRoleAssignmentArgs = (
  args: readonly string[],
): AdminRoleAssignmentRequest => {
  let username: string | undefined;
  let role: string | undefined;
  let apply = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--apply") {
      if (apply) {
        throw new AdminRoleCliUsageError(`Duplicate argument: ${argument}\n\n${adminRoleCliUsage()}`);
      }
      apply = true;
      continue;
    }
    if (argument === "--username" || argument === "--role") {
      const value = args[index + 1];
      if (value?.startsWith("--")) {
        throw new AdminRoleCliUsageError(`Missing value for ${argument}\n\n${adminRoleCliUsage()}`);
      }
      if (argument === "--username") {
        if (username !== undefined) {
          throw new AdminRoleCliUsageError(`Duplicate argument: ${argument}\n\n${adminRoleCliUsage()}`);
        }
        username = value;
      } else {
        if (role !== undefined) {
          throw new AdminRoleCliUsageError(`Duplicate argument: ${argument}\n\n${adminRoleCliUsage()}`);
        }
        role = value;
      }
      index += 1;
      continue;
    }
    throw new AdminRoleCliUsageError(`Unknown command option\n\n${adminRoleCliUsage()}`);
  }

  const normalizedUsername = requiredArgument(username, "--username");
  if (normalizedUsername.length > 50) {
    throw new AdminRoleCliUsageError("Username must be at most 50 characters");
  }

  const normalizedRole = requiredArgument(role, "--role");
  if (!isAdminRole(normalizedRole)) {
    throw new AdminRoleCliUsageError(`Invalid role. Allowed roles: ${ADMIN_ROLES.join(", ")}`);
  }

  return { username: normalizedUsername, role: normalizedRole, apply };
};
