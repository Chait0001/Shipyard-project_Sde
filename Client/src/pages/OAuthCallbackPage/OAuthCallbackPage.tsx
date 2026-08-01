import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './OAuthCallbackPage.css'

type CallbackStatus = 'processing' | 'error'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<CallbackStatus>('processing')
  const [errorMessage, setErrorMessage] = useState('')
  const { user, isAuthenticated, loginWithGitHub } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If user is already authenticated via Clerk or token, redirect to dashboard immediately
    if (isAuthenticated || user) {
      navigate('/dashboard', { replace: true })
      return
    }

    async function handleCallback() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      // GitHub returned an explicit error
      if (error) {
        const description =
          searchParams.get('error_description') || 'GitHub authorisation was denied.'
        setErrorMessage(description)
        setStatus('error')
        return
      }

      // If authorization code is present, exchange with backend
      if (code) {
        // Validate CSRF state token if state was generated locally
        const storedState = sessionStorage.getItem('github_oauth_state')
        if (storedState && state && state !== storedState) {
          setErrorMessage('Invalid state parameter. Please try again.')
          setStatus('error')
          return
        }

        sessionStorage.removeItem('github_oauth_state')

        try {
          await loginWithGitHub(code)
          navigate('/dashboard', { replace: true })
        } catch (err) {
          const axiosError = err as { response?: { data?: { error?: string; message?: string } } }
          const message =
            axiosError.response?.data?.error ||
            axiosError.response?.data?.message ||
            'GitHub authentication failed. Please try again.'
          setErrorMessage(message)
          setStatus('error')
        }
        return
      }

      // If no code in URL (e.g. returning from Clerk OAuth redirect), wait briefly for Clerk user sync
      const timer = setTimeout(() => {
        const token = localStorage.getItem('token')
        if (token || isAuthenticated) {
          navigate('/dashboard', { replace: true })
        } else {
          // If still no token after timeout, redirect to dashboard or login
          navigate('/dashboard', { replace: true })
        }
      }, 1500)

      return () => clearTimeout(timer)
    }

    handleCallback()
  }, [searchParams, isAuthenticated, user, loginWithGitHub, navigate])

  if (status === 'error') {
    return (
      <div className="oauth-callback-page">
        <div className="oauth-callback-card">
          <div className="oauth-callback-icon oauth-callback-icon--error" aria-hidden="true">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="oauth-callback-title">Authentication failed</h1>
          <p className="oauth-callback-message">{errorMessage}</p>
          <a href="/login" className="oauth-callback-link">
            Back to login
          </a>
        </div>
      </div>
    )
  }

  // Default: processing state with spinner
  return (
    <div className="oauth-callback-page">
      <div className="oauth-callback-card">
        <div className="oauth-callback-spinner" aria-hidden="true" />
        <h1 className="oauth-callback-title">Authenticating with GitHub…</h1>
        <p className="oauth-callback-message">Please wait while we verify your identity.</p>
      </div>
    </div>
  )
}
