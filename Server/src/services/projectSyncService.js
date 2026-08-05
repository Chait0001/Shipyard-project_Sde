const GithubAccount = require('../models/GithubAccount');
const GithubRepository = require('../models/GithubRepository');
const Project = require('../models/Project');
const PullRequest = require('../models/PullRequest');
const Issue = require('../models/Issue');
const { GithubApiError, GithubClient, parseGithubRepoInput } = require('./githubService');
const { syncPullRequestsToStore } = require('./pullRequestSync');
const { syncIssuesToStore } = require('./issueSync');
const { decryptToken } = require('../utils/githubTokenCrypto');

const log = (event, meta = {}) => {
  console.log(JSON.stringify({ event, ...meta, at: new Date().toISOString() }));
};

const getGithubClientForUser = async (userId) => {
  const account = await GithubAccount.findOne({ where: { userId } });

  if (!account) {
    throw new GithubApiError(
      'Connect GitHub before creating a project from a repository.',
      409,
      'GITHUB_NOT_CONNECTED'
    );
  }

  const accessToken = decryptToken(account.accessToken);
  return {
    account,
    client: new GithubClient(accessToken),
  };
};

const syncOpenPullRequests = async ({ client, owner, repo, projectId, githubRepositoryId }) => {
  const { pullRequests, truncated } = await client.listOpenPullRequests(owner, repo);
  const result = await syncPullRequestsToStore({
    pullRequests,
    projectId,
    githubRepositoryId,
    store: PullRequest,
  });

  return {
    syncedCount: result.syncedCount,
    truncated,
  };
};

const syncIssues = async ({ client, owner, repo, projectId, githubRepositoryId }) => {
  const { issues, truncated } = await client.listIssues(owner, repo);
  const result = await syncIssuesToStore({
    issues,
    projectId,
    githubRepositoryId,
    store: Issue,
  });

  return {
    syncedCount: result.syncedCount,
    truncated,
  };
};

// Resyncs an already-resolved Project + GithubRepository against GitHub: pull requests,
// issues, and the resulting syncStatus/lastSyncedAt. Shared by manual create/resync and
// the auto-sync worker so both paths flip status the same way.
const syncProjectData = async ({ project, githubRepository, client }) => {
  log('project_sync_started', { projectId: project.id, repo: githubRepository.fullName });

  await project.update({ syncStatus: 'syncing', lastSyncedAt: new Date() });

  try {
    const prResult = await syncOpenPullRequests({
      client,
      owner: githubRepository.owner,
      repo: githubRepository.name,
      projectId: project.id,
      githubRepositoryId: githubRepository.id,
    });
    log('pull_requests_synced', { projectId: project.id, count: prResult.syncedCount, truncated: prResult.truncated });

    const issueResult = await syncIssues({
      client,
      owner: githubRepository.owner,
      repo: githubRepository.name,
      projectId: project.id,
      githubRepositoryId: githubRepository.id,
    });
    log('issues_synced', { projectId: project.id, count: issueResult.syncedCount, truncated: issueResult.truncated });

    const truncated = prResult.truncated || issueResult.truncated;
    const now = new Date();

    await githubRepository.update({ lastSyncedAt: now });
    await project.update({
      syncStatus: truncated ? 'partial' : 'complete',
      lastSyncedAt: now,
    });

    log('project_sync_completed', { projectId: project.id, syncStatus: project.syncStatus });

    return {
      status: project.syncStatus,
      syncedPullRequests: prResult.syncedCount,
      syncedIssues: issueResult.syncedCount,
      truncated,
    };
  } catch (error) {
    log('project_sync_failed', { projectId: project.id, error: error.message, stack: error.stack });
    await project.update({ syncStatus: 'failed' });
    throw error;
  }
};

const createProjectFromGithubRepo = async ({ userId, repoUrl }) => {
  const { owner, repo } = parseGithubRepoInput(repoUrl);
  const { account, client } = await getGithubClientForUser(userId);
  const repository = await client.getRepository(owner, repo);

  await client.verifyRepositoryAccess(owner, repo, account.githubLogin);

  const [project] = await Project.findOrCreate({
    where: { githubPrimaryRepoId: String(repository.id) },
    defaults: {
      title: repository.name,
      name: repository.name,
      description: repository.description,
      status: 'active',
      syncStatus: 'syncing',
      githubPrimaryRepoId: String(repository.id),
      createdById: userId,
      ownerId: userId,
    },
  });

  const [githubRepository] = await GithubRepository.findOrCreate({
    where: { externalRepoId: String(repository.id) },
    defaults: {
      projectId: project.id,
      githubAccountId: account.id,
      owner: repository.owner.login,
      name: repository.name,
      fullName: repository.full_name,
      externalRepoId: String(repository.id),
      defaultBranch: repository.default_branch,
      visibility: repository.visibility || (repository.private ? 'private' : 'public'),
      githubUrl: repository.html_url,
    },
  });

  await githubRepository.update({
    projectId: project.id,
    githubAccountId: account.id,
    owner: repository.owner.login,
    name: repository.name,
    fullName: repository.full_name,
    defaultBranch: repository.default_branch,
    visibility: repository.visibility || (repository.private ? 'private' : 'public'),
    githubUrl: repository.html_url,
  });

  const syncResult = await syncProjectData({ project, githubRepository, client });

  return {
    project,
    repository: githubRepository,
    sync: syncResult,
  };
};

module.exports = {
  createProjectFromGithubRepo,
  getGithubClientForUser,
  parseGithubRepoInput,
  syncOpenPullRequests,
  syncIssues,
  syncProjectData,
};
