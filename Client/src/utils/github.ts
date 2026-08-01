/* ============================================================
   GitHub OAuth — Configuration and helpers
   ============================================================ */

/**
 * GitHub OAuth Application Client ID.
 * Uses the Vite environment variable `VITE_GITHUB_CLIENT_ID`.
 */
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? ''

/**
 * The OAuth scopes requested from GitHub.
 */
const GITHUB_SCOPES = 'read:user user:email'

/**
 * Build the full GitHub OAuth authorisation URL and redirect the
 * browser. A random `state` parameter is generated and stored in
 * `sessionStorage` so the callback page can validate it and prevent
 * CSRF attacks.
 */
export function redirectToGitHub(): void {
  const state = crypto.randomUUID()
  sessionStorage.setItem('github_oauth_state', state)

  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_ID.trim() !== '') {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      scope: GITHUB_SCOPES,
      state,
      redirect_uri: `${window.location.origin}/oauth/github/callback`,
    })

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
  } else {
    // Development / demo fallback when VITE_GITHUB_CLIENT_ID is not configured
    console.warn(
      '[GitHub OAuth] VITE_GITHUB_CLIENT_ID is not configured. Falling back to local authentication flow.',
    )
    const callbackUrl = `/oauth/github/callback?code=demo_github_auth_code_${Date.now()}&state=${state}`
    window.location.href = callbackUrl
  }
}
