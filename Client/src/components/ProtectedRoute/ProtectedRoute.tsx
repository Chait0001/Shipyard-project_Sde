import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { hasRole } from '@/utils/roles'
import type { Role } from '@/utils/roles'
import './ProtectedRoute.css'

interface ProtectedRouteProps {
  /**
   * Optional list of roles allowed to access the nested routes.
   * When omitted, any authenticated user can access the routes.
   * When provided, the user's `globalRole` must be in this list.
   */
  allowedRoles?: Role[]
}

/**
 * ProtectedRoute — Wraps authenticated-only routes.
 *
 * Behaviour:
 * 1. While the auth state is loading (initial token check on mount),
 *    renders a full-page loading skeleton to avoid a flash of the
 *    login page.
 * 2. If the user is not authenticated, redirects to `/login` and
 *    preserves the original URL in `location.state.from` so the
 *    login page can redirect back after a successful sign-in.
 * 3. If `allowedRoles` is provided and the user's role is not in the
 *    list, renders an access-denied message.
 * 4. If authenticated (and authorised), renders the nested child
 *    routes via `<Outlet />`.
 *
 * Usage in App.tsx:
 * ```tsx
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<DashboardPage />} />
 * </Route>
 *
 * <Route element={<ProtectedRoute allowedRoles={['admin', 'owner']} />}>
 *   <Route path="/admin" element={<AdminPage />} />
 * </Route>
 * ```
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading skeleton while initial auth check completes
  if (isLoading) {
    return (
      <div className="protected-route-loading" aria-label="Loading application">
        <div className="protected-route-spinner" aria-hidden="true" />
        <p className="protected-route-text">Loading…</p>
      </div>
    )
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && !hasRole(user?.globalRole, allowedRoles)) {
    return (
      <div className="protected-route-loading" role="alert">
        <div className="protected-route-denied-icon" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="protected-route-denied-title">Access denied</h1>
        <p className="protected-route-text">You do not have permission to view this page.</p>
        <a href="/dashboard" className="protected-route-link">
          Return to dashboard
        </a>
      </div>
    )
  }

  // Render the protected child route
  return <Outlet />
}
