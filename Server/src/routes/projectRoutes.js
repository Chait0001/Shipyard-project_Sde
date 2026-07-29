const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  syncProjectFromGithub,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

router.route('/')
  .post(createProject)
  .get(getProjects);

router.post('/sync', syncProjectFromGithub);

router.route('/:id')
  .get(getProjectById);

module.exports = router;
