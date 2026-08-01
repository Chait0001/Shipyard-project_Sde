import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { redirectToGitHub } from '@/utils/github'
import '@/styles/auth.css'

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

const FEATURES = [
  'Sync pull requests across every connected repo',
  'Track releases and deploy velocity in real time',
  'Manage teams, roles, and access in one place',
]

export function LoginPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const location = useLocation()

  // Redirect back to the page the user originally requested (set by ProtectedRoute)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  function handleGitHubLogin() {
    setIsConnecting(true)
    redirectToGitHub(from)
  }

  return (
    <div className="auth-page">
      <div className="auth-glow" aria-hidden="true" />
      <div className="auth-card">
        <div className="auth-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2L21 6.5V17.5L12 22L3 17.5V6.5L12 2Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M3 6.5L12 11L21 6.5M12 11V22"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <header className="auth-header">
          <h1 className="auth-logo">Shipyard</h1>
          <p className="auth-subtitle">Deployment orchestration for teams that ship fast.</p>
        </header>

        <Button
          variant="primary"
          size="lg"
          iconLeft={<GitHubIcon />}
          onClick={handleGitHubLogin}
          isLoading={isConnecting}
          className="auth-github-btn"
        >
          Continue with GitHub
        </Button>

        <p className="auth-hint">
          Your account is created automatically the first time you sign in.
        </p>

        <ul className="auth-features">
          {FEATURES.map((feature) => (
            <li key={feature}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
