const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, connectGithub } = require('../controllers/authController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/github', optionalProtect, connectGithub);

module.exports = router;
