const GithubAccount = require('../models/GithubAccount');
const GithubRepository = require('../models/GithubRepository');
const Project = require('../models/Project');
const PullRequest = require('../models/PullRequest');
const { GithubApiError, GithubClient, parseGithubRepoInput } = require('./githubService');
const { syncPullRequestsToStore } = require('./pullRequestSync');
const { decryptToken } = require('../utils/githubTokenCrypto');

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
      createdById: userId,
      ownerId: userId,
    },
  });

  await project.update({
    syncStatus: 'syncing',
    lastSyncedAt: new Date(),
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

  try {
    const syncResult = await syncOpenPullRequests({
      client,
      owner: repository.owner.login,
      repo: repository.name,
      projectId: project.id,
      githubRepositoryId: githubRepository.id,
    });

    await githubRepository.update({ lastSyncedAt: new Date() });
    await project.update({
      syncStatus: syncResult.truncated ? 'partial' : 'complete',
      lastSyncedAt: new Date(),
    });

    return {
      project,
      repository: githubRepository,
      sync: {
        status: project.syncStatus,
        syncedPullRequests: syncResult.syncedCount,
        truncated: syncResult.truncated,
      },
    };
  } catch (error) {
    await project.update({ syncStatus: 'failed' });
    throw error;
  }
};

module.exports = {
  createProjectFromGithubRepo,
  getGithubClientForUser,
  parseGithubRepoInput,
  syncOpenPullRequests,
};
