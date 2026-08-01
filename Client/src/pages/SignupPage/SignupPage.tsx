import { Navigate } from 'react-router-dom'

// Signing up and signing in are the same GitHub OAuth action now,
// so this route folds into the login page rather than duplicating it.
export function SignupPage() {
  return <Navigate to="/login" replace />
}
