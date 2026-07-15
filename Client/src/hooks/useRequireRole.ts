import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from './useRole'
import type { Role } from '@/utils/roles'

interface UseRequireRoleOptions {
  /**
   * The minimum role required to access the current page/component.
   * If not provided, `allowedRoles` must be set instead.
   */
  minimumRole?: Role

  /**
   * An explicit set of roles allowed to access the current page/component.
   * Takes precedence over `minimumRole` when both are provided.
   */
  allowedRoles?: Role[]

  /**
   * Where to redirect if the user's role is insufficient.
   * @default '/dashboard'
   */
  redirectTo?: string
}

/**
 * useRequireRole — Imperative role guard hook.
 *
 * Checks the user's role against `minimumRole` or `allowedRoles`.
 * If the check fails, the user is redirected to `redirectTo`.
 * Returns `{ authorised }` so the component can conditionally
 * render content or show a fallback.
 *
 * @example
 * const { authorised } = useRequireRole({ minimumRole: 'admin' })
 * if (!authorised) return null
 */
export function useRequireRole({
  minimumRole,
  allowedRoles,
  redirectTo = '/dashboard',
}: UseRequireRoleOptions) {
  const { isAtLeast, is } = useRole()
  const navigate = useNavigate()

  const authorised = allowedRoles ? is(allowedRoles) : minimumRole ? isAtLeast(minimumRole) : true

  useEffect(() => {
    if (!authorised) {
      navigate(redirectTo, { replace: true })
    }
  }, [authorised, navigate, redirectTo])

  return { authorised }
}
