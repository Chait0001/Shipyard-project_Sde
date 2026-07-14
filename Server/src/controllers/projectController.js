const Project = require('../models/Project');

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
      description,
      status: status || 'pending',
      ownerId: req.user.id,
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
    const project = await Project.findByPk(req.params.id);

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

module.exports = {
  createProject,
  getProjects,
  getProjectById,
};
