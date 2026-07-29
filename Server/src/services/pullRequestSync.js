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
};
