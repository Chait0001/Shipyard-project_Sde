const { Op } = require('sequelize');
const Project = require('../models/Project');
const GithubRepository = require('../models/GithubRepository');
const GithubAccount = require('../models/GithubAccount');
const Issue = require('../models/Issue');
const PullRequest = require('../models/PullRequest');

const repoInclude = {
  model: GithubRepository,
  as: 'githubRepository',
  attributes: ['id', 'fullName', 'githubUrl'],
};

const projectInclude = {
  model: Project,
  as: 'project',
  attributes: ['id', 'title', 'name'],
};

// @desc    Assigned issues + active PRs for the connected GitHub user, across all owned projects
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const account = await GithubAccount.findOne({ where: { userId: req.user.id } });

    const projects = await Project.findAll({
      where: { ownerId: req.user.id },
      attributes: ['id'],
    });
    const projectIds = projects.map((project) => project.id);

    if (!account || projectIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          assignedIssues: [],
          activePRs: [],
          githubConnected: Boolean(account),
          hasProjects: projectIds.length > 0,
        },
      });
    }

    const pullRequests = await PullRequest.findAll({
      where: { projectId: { [Op.in]: projectIds }, status: 'open' },
      include: [projectInclude, repoInclude],
      order: [['githubUpdatedAt', 'DESC']],
    });

    const issues = await Issue.findAll({
      where: {
        projectId: { [Op.in]: projectIds },
        assigneeGithubUsername: account.githubLogin,
      },
      include: [projectInclude, repoInclude],
      order: [['githubUpdatedAt', 'DESC']],
    });

    const activePRs = pullRequests.map((pullRequest) => ({
      ...pullRequest.toJSON(),
      linkedIssueCount: (pullRequest.linkedIssueNumbers || []).length,
    }));

    const assignedIssues = issues.map((issue) => {
      const matchingPullRequests = pullRequests.filter((pr) =>
        (pr.linkedIssueNumbers || []).includes(issue.githubIssueNumber) &&
        pr.projectId === issue.projectId
      );

      return {
        ...issue.toJSON(),
        linkedPullRequestCount: matchingPullRequests.length,
        closingPullRequest: matchingPullRequests[0]
          ? { number: matchingPullRequests[0].number, githubUrl: matchingPullRequests[0].githubUrl }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      data: { assignedIssues, activePRs, githubConnected: true, hasProjects: true },
    });
  } catch (error) {
    console.error(`Get Dashboard Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving dashboard data',
    });
  }
};

module.exports = {
  getDashboard,
};
