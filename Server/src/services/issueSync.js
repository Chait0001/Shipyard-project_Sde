const toIssuePayload = (issue, projectId, githubRepositoryId) => ({
  projectId,
  githubRepositoryId,
  githubIssueId: String(issue.id),
  githubIssueNumber: issue.number,
  title: issue.title,
  body: issue.body || null,
  state: issue.state,
  labels: (issue.labels || []).map((label) => (typeof label === 'string' ? label : label.name)),
  authorGithubUsername: issue.user?.login || null,
  authorGithubId: issue.user?.id ? String(issue.user.id) : null,
  assigneeGithubUsername: issue.assignee?.login || null,
  assigneeGithubId: issue.assignee?.id ? String(issue.assignee.id) : null,
  githubCreatedAt: issue.created_at,
  githubUpdatedAt: issue.updated_at,
  githubClosedAt: issue.closed_at,
  lastSyncedAt: new Date(),
});

const syncIssuesToStore = async ({ issues, projectId, githubRepositoryId, store }) => {
  for (const issue of issues) {
    await store.upsert(toIssuePayload(issue, projectId, githubRepositoryId), {
      conflictFields: ['githubIssueId'],
    });
  }

  return {
    syncedCount: issues.length,
  };
};

module.exports = {
  syncIssuesToStore,
  toIssuePayload,
};
