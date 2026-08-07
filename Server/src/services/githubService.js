const GITHUB_API_BASE = 'https://api.github.com';

class GithubApiError extends Error {
  constructor(message, status, code = 'GITHUB_API_ERROR') {
    super(message);
    this.name = 'GithubApiError';
    this.status = status;
    this.code = code;
  }
}

const parseGithubRepoInput = (input) => {
  const value = String(input || '').trim();

  if (!value) {
    throw new GithubApiError('Repository URL is required', 400, 'INVALID_REPO_URL');
  }

  const shorthand = value.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shorthand) {
    return {
      owner: shorthand[1],
      repo: shorthand[2].replace(/\.git$/, ''),
    };
  }

  try {
    const url = new URL(value);
    const isGithubHost = url.hostname === 'github.com' || url.hostname === 'www.github.com';
    const parts = url.pathname.split('/').filter(Boolean);

    if (!isGithubHost || parts.length < 2) {
      throw new Error('Unsupported GitHub URL');
    }

    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/, ''),
    };
  } catch (error) {
    throw new GithubApiError(
      'Enter a GitHub repository URL like https://github.com/owner/repo or owner/repo.',
      400,
      'INVALID_REPO_URL'
    );
  }
};

const getNextLink = (linkHeader) => {
  if (!linkHeader) return null;

  const links = linkHeader.split(',').map((item) => item.trim());
  const next = links.find((item) => item.endsWith('rel="next"'));
  if (!next) return null;

  const match = next.match(/<([^>]+)>/);
  return match ? match[1] : null;
};

class GithubClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async request(pathOrUrl, options = {}) {
    const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${GITHUB_API_BASE}${pathOrUrl}`;
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Shipyard-App',
      ...(options.headers || {}),
    };

    if (this.accessToken && this.accessToken !== 'auth_provider_managed') {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
    if (response.status === 403 && rateLimitRemaining === '0') {
      throw new GithubApiError(
        'GitHub rate limit exceeded. Please try again later.',
        429,
        'GITHUB_RATE_LIMITED'
      );
    }

    if (response.status === 204) {
      return { data: null, headers: response.headers };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message = data?.message || 'GitHub API request failed';
      throw new GithubApiError(message, response.status, 'GITHUB_API_ERROR');
    }

    return { data, headers: response.headers };
  }

  async getViewer() {
    const { data } = await this.request('/user');
    return data;
  }

  async getPrimaryEmail() {
    const { data } = await this.request('/user/emails');
    const primary = data.find((email) => email.primary && email.verified);
    const verified = data.find((email) => email.verified);

    return primary?.email || verified?.email || null;
  }

  async getRepository(owner, repo) {
    try {
      const { data } = await this.request(`/repos/${owner}/${repo}`);
      return data;
    } catch (error) {
      if (error.status === 404) {
        throw new GithubApiError('Repository not found or inaccessible.', 404, 'REPO_NOT_FOUND');
      }
      throw error;
    }
  }

  async verifyRepositoryAccess(owner, repo, githubLogin) {
    if (!this.accessToken || this.accessToken === 'auth_provider_managed') {
      try {
        await this.getRepository(owner, repo);
        return 'read';
      } catch (error) {
        if (error.status === 404) {
          throw error;
        }
        return 'read';
      }
    }

    try {
      const { data } = await this.request(
        `/repos/${owner}/${repo}/collaborators/${githubLogin}/permission`
      );
      const permission = data?.permission;
      const allowed = ['admin', 'maintain', 'write', 'triage', 'read'].includes(permission);

      if (!allowed) {
        throw new GithubApiError(
          'Your GitHub account does not have access to this repository.',
          403,
          'REPO_ACCESS_DENIED'
        );
      }

      return permission;
    } catch (error) {
      if (error.status === 404 || error.status === 403) {
        throw new GithubApiError(
          'Your GitHub account does not have access to this repository.',
          403,
          'REPO_ACCESS_DENIED'
        );
      }
      throw error;
    }
  }

  async listOpenPullRequests(owner, repo, maxPages = 10) {
    const pullRequests = [];
    let nextUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=open&per_page=100`;
    let pages = 0;

    while (nextUrl && pages < maxPages) {
      const { data, headers } = await this.request(nextUrl);
      pullRequests.push(...data);
      nextUrl = getNextLink(headers.get('link'));
      pages += 1;
    }

    return {
      pullRequests,
      truncated: Boolean(nextUrl),
    };
  }

  async listIssues(owner, repo, maxPages = 10) {
    const issues = [];
    let nextUrl = `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=all&sort=updated&direction=desc&per_page=100`;
    let pages = 0;

    while (nextUrl && pages < maxPages) {
      const { data, headers } = await this.request(nextUrl);
      // GitHub's /issues endpoint also returns pull requests; exclude them.
      issues.push(...data.filter((item) => !item.pull_request));
      nextUrl = getNextLink(headers.get('link'));
      pages += 1;
    }

    return {
      issues,
      truncated: Boolean(nextUrl),
    };
  }
}

const exchangeCodeForAccessToken = async (code) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new GithubApiError('GitHub OAuth is not configured on the server.', 500, 'OAUTH_NOT_CONFIGURED');
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error || !data.access_token) {
    throw new GithubApiError(
      data.error_description || 'GitHub OAuth token exchange failed.',
      400,
      'OAUTH_EXCHANGE_FAILED'
    );
  }

  return {
    accessToken: data.access_token,
    scopes: data.scope || '',
    tokenType: data.token_type,
  };
};

module.exports = {
  GithubApiError,
  GithubClient,
  exchangeCodeForAccessToken,
  parseGithubRepoInput,
};
