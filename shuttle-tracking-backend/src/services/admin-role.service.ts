export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'DEV'] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

const roleRank: Record<AdminRole, number> = {
  ADMIN: 1,
  SUPER_ADMIN: 2,
  DEV: 3,
};

export const isAdminRole = (value: unknown): value is AdminRole =>
  typeof value === 'string' && ADMIN_ROLES.includes(value as AdminRole);

export const hasMinimumRole = (role: AdminRole, minimum: AdminRole): boolean =>
  roleRank[role] >= roleRank[minimum];
