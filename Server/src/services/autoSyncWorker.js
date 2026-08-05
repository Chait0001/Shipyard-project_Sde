const Project = require('../models/Project');
const GithubRepository = require('../models/GithubRepository');
const { getGithubClientForUser, syncProjectData } = require('./projectSyncService');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const log = (event, meta = {}) => {
  console.log(JSON.stringify({ event, ...meta, at: new Date().toISOString() }));
};

const runAutoSyncTick = async () => {
  const projects = await Project.findAll({
    include: [{ model: GithubRepository, as: 'githubRepositories' }],
  });

  const staggerMs = Number(process.env.AUTO_SYNC_STAGGER_MS) || 3000;

  for (const project of projects) {
    const githubRepository = project.githubRepositories?.[0];
    if (!githubRepository) continue;

    try {
      const { client } = await getGithubClientForUser(project.ownerId);
      await syncProjectData({ project, githubRepository, client });
    } catch (error) {
      log('auto_sync_project_failed', { projectId: project.id, error: error.message });
    }

    await sleep(staggerMs);
  }
};

const startAutoSyncWorker = () => {
  const intervalMinutes = Number(process.env.AUTO_SYNC_INTERVAL_MINUTES) || 15;
  const intervalMs = intervalMinutes * 60 * 1000;

  log('auto_sync_worker_started', { intervalMinutes });

  setInterval(() => {
    log('auto_sync_tick_started');
    runAutoSyncTick()
      .then(() => log('auto_sync_tick_completed'))
      .catch((error) => log('auto_sync_tick_failed', { error: error.message }));
  }, intervalMs);
};

module.exports = {
  startAutoSyncWorker,
  runAutoSyncTick,
};
