/* ============================================================
   GitHub OAuth — Configuration and helpers
   ============================================================ */

/**
 * GitHub OAuth Application Client ID.
 * Uses the Vite environment variable `VITE_GITHUB_CLIENT_ID`.
 * Falls back to an empty string so the build never breaks — the
 * redirect helper will guard against a missing value at runtime.
 */
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? ''

/**
 * The OAuth scopes requested from GitHub.
 * Shipyard needs repository access so it can verify a connected user
 * can read private repos and sync pull requests.
 */
const GITHUB_SCOPES = 'repo read:user user:email'

/**
 * Build the full GitHub OAuth authorisation URL and redirect the
 * browser.  A random `state` parameter is generated and stored in
 * `sessionStorage` so the callback page can validate it and prevent
 * CSRF attacks.
 */
export function redirectToGitHub(returnTo = '/dashboard'): void {
  if (!GITHUB_CLIENT_ID) {
    console.error(
      '[GitHub OAuth] VITE_GITHUB_CLIENT_ID is not set. ' +
        'Add it to your .env file or Vite environment config.',
    )
    return
  }

  // Generate a random state token for CSRF protection
  const state = crypto.randomUUID()
  sessionStorage.setItem('github_oauth_state', state)
  sessionStorage.setItem('github_oauth_return_to', returnTo)

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: GITHUB_SCOPES,
    state,
    redirect_uri: `${window.location.origin}/oauth/github/callback`,
  })

  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
}
