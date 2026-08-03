const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getGitHubProfile, getGitHubRepos } = require('../controllers/githubController');

// All GitHub data routes are protected
router.use(protect);

router.get('/profile', getGitHubProfile);
router.get('/repos', getGitHubRepos);

module.exports = router;
