const CLOSING_KEYWORD_PATTERN = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\b\s*:?\s*#(\d+)/gi;

const parseClosingIssueNumbers = (body) => {
  if (!body) return [];

  const numbers = new Set();
  for (const match of body.matchAll(CLOSING_KEYWORD_PATTERN)) {
    numbers.add(Number(match[1]));
  }

  return [...numbers];
};

const toPullRequestPayload = (pullRequest, projectId, githubRepositoryId) => ({
  projectId,
  githubRepositoryId,
  externalPullRequestId: String(pullRequest.id),
  number: pullRequest.number,
  title: pullRequest.title,
  author: pullRequest.user?.login || null,
  status: pullRequest.merged_at ? 'merged' : pullRequest.state,
  githubUrl: pullRequest.html_url,
  githubCreatedAt: pullRequest.created_at,
  githubUpdatedAt: pullRequest.updated_at,
  linkedIssueNumbers: parseClosingIssueNumbers(pullRequest.body),
  lastSyncedAt: new Date(),
});

const syncPullRequestsToStore = async ({ pullRequests, projectId, githubRepositoryId, store }) => {
  for (const pullRequest of pullRequests) {
    await store.upsert(toPullRequestPayload(pullRequest, projectId, githubRepositoryId), {
      conflictFields: ['githubRepositoryId', 'externalPullRequestId'],
    });
  }

  return {
    syncedCount: pullRequests.length,
  };
};

module.exports = {
  syncPullRequestsToStore,
  toPullRequestPayload,
  parseClosingIssueNumbers,
};
