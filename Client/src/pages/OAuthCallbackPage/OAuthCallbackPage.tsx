import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './OAuthCallbackPage.css'

type CallbackStatus = 'processing' | 'error'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<CallbackStatus>('processing')
  const [errorMessage, setErrorMessage] = useState('')
  const { connectGitHub } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      // GitHub returned an error (e.g. user denied access)
      if (error) {
        const description =
          searchParams.get('error_description') || 'GitHub authorisation was denied.'
        setErrorMessage(description)
        setStatus('error')
        return
      }

      // Missing authorisation code
      if (!code) {
        setErrorMessage('No authorisation code received from GitHub.')
        setStatus('error')
        return
      }

      // Validate CSRF state token
      const storedState = sessionStorage.getItem('github_oauth_state')
      if (!state || state !== storedState) {
        setErrorMessage('Invalid state parameter — possible CSRF attack. Please try again.')
        setStatus('error')
        return
      }

      // Clean up the stored state
      sessionStorage.removeItem('github_oauth_state')

      try {
        await connectGitHub(code)
        const returnTo = sessionStorage.getItem('github_oauth_return_to') || '/dashboard/projects'
        sessionStorage.removeItem('github_oauth_return_to')
        navigate(returnTo, { replace: true })
      } catch (err) {
        const axiosError = err as { response?: { data?: { error?: string; message?: string } } }
        const message =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          'GitHub connection failed. Please try again.'
        setErrorMessage(message)
        setStatus('error')
      }
    }

    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <h1 className="oauth-callback-title">GitHub connection failed</h1>
          <p className="oauth-callback-message">{errorMessage}</p>
          <a href="/login" className="oauth-callback-link">
            Back to Shipyard
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
        <h1 className="oauth-callback-title">Connecting GitHub...</h1>
        <p className="oauth-callback-message">Please wait while we store your repository access.</p>
      </div>
    </div>
  )
}
