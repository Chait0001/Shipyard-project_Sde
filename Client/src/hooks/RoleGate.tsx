import type { ReactNode } from 'react'
import { useRole } from './useRole'
import type { Role } from '@/utils/roles'

interface RoleGateProps {
  /**
   * The minimum role required to see the children.
   * If not provided, `allowedRoles` must be set instead.
   */
  minimumRole?: Role

  /**
   * An explicit set of roles allowed to see the children.
   * Takes precedence over `minimumRole` when both are provided.
   */
  allowedRoles?: Role[]

  /**
   * Content to render when the user meets the role requirement.
   */
  children: ReactNode

  /**
   * Optional fallback content to render when the user does not
   * meet the role requirement. Defaults to rendering nothing.
   */
  fallback?: ReactNode
}

/**
 * RoleGate — Declarative component for conditional rendering
 * based on the current user's role.
 *
 * @example
 * <RoleGate minimumRole="admin">
 *   <button>Delete Team</button>
 * </RoleGate>
 *
 * @example
 * <RoleGate allowedRoles={['admin', 'owner']} fallback={<p>Insufficient permissions</p>}>
 *   <AdminPanel />
 * </RoleGate>
 */
export function RoleGate({ minimumRole, allowedRoles, children, fallback = null }: RoleGateProps) {
  const { isAtLeast, is } = useRole()

  const authorised = allowedRoles ? is(allowedRoles) : minimumRole ? isAtLeast(minimumRole) : true

  return authorised ? <>{children}</> : <>{fallback}</>
}
