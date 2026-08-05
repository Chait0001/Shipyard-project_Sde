const test = require('node:test');
const assert = require('node:assert/strict');
const { syncIssuesToStore, toIssuePayload } = require('./issueSync');
const { parseClosingIssueNumbers } = require('./pullRequestSync');

test('parseClosingIssueNumbers finds GitHub closing keywords, case-insensitively, deduped', () => {
  assert.deepEqual(parseClosingIssueNumbers('This closes #12 and also Fixes #7.'), [12, 7]);
  assert.deepEqual(parseClosingIssueNumbers('resolves: #3'), [3]);
  assert.deepEqual(parseClosingIssueNumbers('Closes #5, closes #5 again'), [5]);
  assert.deepEqual(parseClosingIssueNumbers('No closing keyword here, just #9 mentioned.'), []);
  assert.deepEqual(parseClosingIssueNumbers(null), []);
});

test('toIssuePayload maps GitHub issue fields to the store shape', () => {
  const issue = {
    id: 555,
    number: 12,
    title: 'Fetch Issue Data',
    body: 'Some description',
    state: 'open',
    labels: [{ name: 'backend' }, 'frontend'],
    user: { login: 'octo-dev', id: 42 },
    assignee: { login: 'octo-assignee', id: 43 },
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-02T00:00:00Z',
    closed_at: null,
  };

  const payload = toIssuePayload(issue, 'project-1', 'repo-1');

  assert.equal(payload.githubIssueId, '555');
  assert.equal(payload.githubIssueNumber, 12);
  assert.deepEqual(payload.labels, ['backend', 'frontend']);
  assert.equal(payload.assigneeGithubUsername, 'octo-assignee');
  assert.equal(payload.projectId, 'project-1');
  assert.equal(payload.githubRepositoryId, 'repo-1');
});

test('syncIssuesToStore upserts on githubIssueId so repeat syncs do not duplicate rows', async () => {
  const rows = new Map();
  const store = {
    async upsert(payload) {
      rows.set(payload.githubIssueId, payload);
    },
  };
  const issues = [
    {
      id: 555,
      number: 12,
      title: 'Fetch Issue Data',
      state: 'open',
      labels: [],
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-02T00:00:00Z',
    },
  ];

  await syncIssuesToStore({ issues, projectId: 'project-1', githubRepositoryId: 'repo-1', store });
  await syncIssuesToStore({
    issues: [{ ...issues[0], title: 'Updated title', state: 'closed' }],
    projectId: 'project-1',
    githubRepositoryId: 'repo-1',
    store,
  });

  assert.equal(rows.size, 1);
  assert.equal(rows.get('555').title, 'Updated title');
  assert.equal(rows.get('555').state, 'closed');
});
