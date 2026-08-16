import "dotenv/config";
import { AdminRoleCliUsageError, parseAdminRoleAssignmentArgs } from "./admin-role-cli.js";

const logValue = (value: string): string => JSON.stringify(value);

const main = async (): Promise<void> => {
  const request = parseAdminRoleAssignmentArgs(process.argv.slice(2));
  const { prisma } = await import("../config/prisma.js");

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: request.username },
      select: { id: true, username: true, role: true },
    });

    if (!existingUser) {
      throw new Error("No admin profile found for the requested username");
    }

    if (!request.apply) {
      console.log(
        `level=info event=admin_role.dry_run username=${logValue(existingUser.username)} current_role=${existingUser.role} requested_role=${request.role}`,
      );
      return;
    }

    if (existingUser.role === request.role) {
      console.log(
        `level=info event=admin_role.unchanged username=${logValue(existingUser.username)} role=${existingUser.role}`,
      );
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: request.role },
      select: { username: true, role: true },
    });
    console.log(
      `level=info event=admin_role.updated username=${logValue(updatedUser.username)} role=${updatedUser.role}`,
    );
  } finally {
    await prisma.$disconnect();
  }
};

void main().catch((error: unknown) => {
  if (error instanceof AdminRoleCliUsageError) {
    console.error(`level=error event=admin_role.invalid_request message=${logValue(error.message)}`);
  } else {
    console.error("level=error event=admin_role.failed");
  }
  process.exitCode = 1;
});
