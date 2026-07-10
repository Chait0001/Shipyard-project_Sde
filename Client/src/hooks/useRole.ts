import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { hasMinimumRole, hasRole } from '@/utils/roles'
import type { Role } from '@/utils/roles'

/**
 * useRole — Provides role information and convenience helpers
 * for the currently authenticated user.
 *
 * @example
 * const { role, isAdmin, isAtLeast, is } = useRole()
 *
 * if (isAdmin) { ... }
 * if (isAtLeast('manager')) { ... }
 * if (is(['admin', 'owner'])) { ... }
 */
export function useRole() {
  const { user } = useAuth()
  const role = (user?.globalRole ?? 'viewer') as Role

  return useMemo(() => {
    /**
     * Check whether the user meets or exceeds a minimum role level.
     * Uses the hierarchical role ordering: viewer < engineer < manager < admin < owner.
     */
    const isAtLeast = (requiredRole: Role): boolean => hasMinimumRole(role, requiredRole)

    /**
     * Check whether the user's role is included in a specific set of roles.
     */
    const is = (allowedRoles: Role[]): boolean => hasRole(role, allowedRoles)

    return {
      /** The user's current role string */
      role,

      /** Convenience booleans for common checks */
      isViewer: role === 'viewer',
      isEngineer: isAtLeast('engineer'),
      isManager: isAtLeast('manager'),
      isAdmin: isAtLeast('admin'),
      isOwner: role === 'owner',

      /** Hierarchical check — is the user at or above the given role? */
      isAtLeast,

      /** Set check — is the user's role in the given array? */
      is,
    }
  }, [role])
}
