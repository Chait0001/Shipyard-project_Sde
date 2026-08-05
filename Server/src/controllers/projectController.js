const Project = require('../models/Project');
const GithubRepository = require('../models/GithubRepository');
const PullRequest = require('../models/PullRequest');
const Issue = require('../models/Issue');
const { GithubApiError } = require('../services/githubService');
const { createProjectFromGithubRepo } = require('../services/projectSyncService');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a project title',
      });
    }

    const project = await Project.create({
      title,
      name: title,
      description,
      status: status || 'pending',
      ownerId: req.user.id,
      createdById: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error(`Create Project Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error during project creation',
    });
  }
};

// @desc    Get all projects for authenticated user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { ownerId: req.user.id },
      include: [
        {
          model: GithubRepository,
          as: 'githubRepositories',
          attributes: ['id', 'owner', 'name', 'fullName', 'githubUrl', 'visibility', 'lastSyncedAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error(`Get Projects Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving projects',
    });
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: GithubRepository,
          as: 'githubRepositories',
          attributes: ['id', 'owner', 'name', 'fullName', 'githubUrl', 'visibility', 'defaultBranch', 'lastSyncedAt'],
        },
        {
          model: PullRequest,
          as: 'pullRequests',
          order: [['githubUpdatedAt', 'DESC']],
        },
        {
          model: Issue,
          as: 'issues',
          order: [['githubUpdatedAt', 'DESC']],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Verify project ownership
    if (project.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this project',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error(`Get Project By ID Error: ${error.message}`);
    // Handle invalid UUID lookup error
    if (error.name === 'SequelizeDatabaseError' || error.message.includes('uuid')) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error retrieving project details',
    });
  }
};

// @desc    Create or resync a project from a GitHub repository URL
// @route   POST /api/projects/sync
// @access  Private
const syncProjectFromGithub = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    const result = await createProjectFromGithubRepo({
      userId: req.user.id,
      repoUrl,
    });

    const project = await Project.findByPk(result.project.id, {
      include: [
        {
          model: GithubRepository,
          as: 'githubRepositories',
          attributes: ['id', 'owner', 'name', 'fullName', 'githubUrl', 'visibility', 'defaultBranch', 'lastSyncedAt'],
        },
        {
          model: PullRequest,
          as: 'pullRequests',
        },
        {
          model: Issue,
          as: 'issues',
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: {
        project,
        sync: result.sync,
      },
    });
  } catch (error) {
    console.error(`Project Sync Error: ${error.message}`);

    if (error instanceof GithubApiError) {
      return res.status(error.status).json({
        success: false,
        code: error.code,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      code: 'PROJECT_SYNC_FAILED',
      error: 'Server error during GitHub project sync',
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  syncProjectFromGithub,
};
