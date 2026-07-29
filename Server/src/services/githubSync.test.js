const test = require('node:test');
const assert = require('node:assert/strict');
const { GithubClient, GithubApiError, parseGithubRepoInput } = require('./githubService');
const { syncPullRequestsToStore } = require('./pullRequestSync');

test('parseGithubRepoInput accepts GitHub URLs and owner/repo shorthand', () => {
  assert.deepEqual(parseGithubRepoInput('https://github.com/acme/api-service'), {
    owner: 'acme',
    repo: 'api-service',
  });

  assert.deepEqual(parseGithubRepoInput('acme/web.git'), {
    owner: 'acme',
    repo: 'web',
  });
});

test('syncPullRequestsToStore uses stable GitHub ids so repeat syncs do not duplicate rows', async () => {
  const rows = new Map();
  const store = {
    async upsert(payload) {
      const key = `${payload.githubRepositoryId}:${payload.externalPullRequestId}`;
      rows.set(key, payload);
    },
  };
  const pullRequests = [
    {
      id: 101,
      number: 7,
      title: 'Initial implementation',
      state: 'open',
      html_url: 'https://github.com/acme/api-service/pull/7',
      user: { login: 'octo-dev' },
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-02T00:00:00Z',
    },
  ];

  await syncPullRequestsToStore({
    pullRequests,
    projectId: 'project-1',
    githubRepositoryId: 'repo-1',
    store,
  });
  await syncPullRequestsToStore({
    pullRequests: [{ ...pullRequests[0], title: 'Updated implementation' }],
    projectId: 'project-1',
    githubRepositoryId: 'repo-1',
    store,
  });

  assert.equal(rows.size, 1);
  assert.equal(rows.get('repo-1:101').title, 'Updated implementation');
});

test('verifyRepositoryAccess maps GitHub 404/403 responses to access denied', async () => {
  const client = new GithubClient('test-token');
  client.request = async () => {
    throw new GithubApiError('Not Found', 404, 'GITHUB_API_ERROR');
  };

  await assert.rejects(
    () => client.verifyRepositoryAccess('acme', 'secret-repo', 'octo-dev'),
    (error) => {
      assert.equal(error.status, 403);
      assert.equal(error.code, 'REPO_ACCESS_DENIED');
      return true;
    }
  );
});
