/* ============================================================
   RBAC — Role types, hierarchy, and permission utilities
   ============================================================ */

/**
 * All available roles in Shipyard.
 * Ordered from lowest to highest privilege.
 */
export type Role = 'viewer' | 'engineer' | 'manager' | 'admin' | 'owner'

/**
 * Numeric privilege level for each role.
 * Higher numbers indicate greater privilege.
 */
const ROLE_LEVELS: Record<Role, number> = {
  viewer: 0,
  engineer: 1,
  manager: 2,
  admin: 3,
  owner: 4,
}

/**
 * Returns the numeric privilege level of a role.
 * Defaults to 0 (viewer) for unknown values.
 */
export function getRoleLevel(role: string | undefined): number {
  return ROLE_LEVELS[role as Role] ?? 0
}

/**
 * Checks whether `userRole` meets or exceeds `requiredRole`
 * in the privilege hierarchy.
 *
 * @example
 * hasMinimumRole('admin', 'manager')  // true
 * hasMinimumRole('viewer', 'engineer') // false
 */
export function hasMinimumRole(
  userRole: string | undefined,
  requiredRole: Role,
): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole)
}

/**
 * Checks whether `userRole` is included in a set of allowed roles.
 *
 * @example
 * hasRole('admin', ['admin', 'owner']) // true
 * hasRole('viewer', ['admin'])         // false
 */
export function hasRole(
  userRole: string | undefined,
  allowedRoles: Role[],
): boolean {
  return allowedRoles.includes(userRole as Role)
}
