const User = require('../models/User');
const GithubAccount = require('../models/GithubAccount');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { exchangeCodeForAccessToken, GithubClient, GithubApiError } = require('../services/githubService');
const { encryptToken } = require('../utils/githubTokenCrypto');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all fields',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token: generateToken(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid user data provided',
      });
    }
  } catch (error) {
    console.error(`Register User Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error during registration',
    });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(`Login User Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication',
    });
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const githubAccount = await GithubAccount.findOne({
      where: { userId: req.user.id },
      attributes: ['githubUserId', 'githubLogin', 'avatarUrl', 'scopes', 'connectedAt', 'lastVerifiedAt'],
    });

    res.status(200).json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      globalRole: req.user.role,
      github: githubAccount
        ? {
            connected: true,
            login: githubAccount.githubLogin,
            avatarUrl: githubAccount.avatarUrl,
            scopes: githubAccount.scopes,
            connectedAt: githubAccount.connectedAt,
            lastVerifiedAt: githubAccount.lastVerifiedAt,
          }
        : { connected: false },
    });
  } catch (error) {
    console.error(`Get Me Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error retrieving current user',
    });
  }
};

const formatUserPayload = (user, githubAccount = null) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: githubAccount?.avatarUrl,
  globalRole: user.role,
  github: githubAccount
    ? {
        connected: true,
        login: githubAccount.githubLogin,
        avatarUrl: githubAccount.avatarUrl,
        scopes: githubAccount.scopes,
        connectedAt: githubAccount.connectedAt,
        lastVerifiedAt: githubAccount.lastVerifiedAt,
      }
    : { connected: false },
});

// @desc    Sign in with GitHub or connect GitHub account for authenticated user
// @route   POST /api/auth/github
// @access  Public with optional authentication
const connectGithub = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'GitHub authorization code is required',
      });
    }

    const tokenResult = await exchangeCodeForAccessToken(code);
    const client = new GithubClient(tokenResult.accessToken);
    const viewer = await client.getViewer();
    const encryptedAccessToken = encryptToken(tokenResult.accessToken);

    let user = req.user || null;

    if (!user) {
      const existingGithubAccount = await GithubAccount.findOne({
        where: { githubUserId: String(viewer.id) },
      });

      if (existingGithubAccount) {
        user = await User.findByPk(existingGithubAccount.userId);
      }
    }

    if (!user) {
      const email = viewer.email || (await client.getPrimaryEmail()) || `${viewer.login}@users.noreply.github.com`;
      const existingUser = await User.findOne({ where: { email } });

      user =
        existingUser ||
        (await User.create({
          name: viewer.name || viewer.login,
          email,
          password: crypto.randomBytes(24).toString('hex'),
          githubUsername: viewer.login,
        }));
    }

    const [githubAccount] = await GithubAccount.findOrCreate({
      where: { userId: user.id },
      defaults: {
        userId: user.id,
        githubUserId: String(viewer.id),
        githubLogin: viewer.login,
        avatarUrl: viewer.avatar_url,
        accessToken: encryptedAccessToken,
        scopes: tokenResult.scopes,
        connectedAt: new Date(),
        lastVerifiedAt: new Date(),
      },
    });

    await githubAccount.update({
      githubUserId: String(viewer.id),
      githubLogin: viewer.login,
      avatarUrl: viewer.avatar_url,
      accessToken: encryptedAccessToken,
      scopes: tokenResult.scopes,
      lastVerifiedAt: new Date(),
    });

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: formatUserPayload(user, githubAccount),
      github: {
        connected: true,
        login: githubAccount.githubLogin,
        avatarUrl: githubAccount.avatarUrl,
        scopes: githubAccount.scopes,
        connectedAt: githubAccount.connectedAt,
        lastVerifiedAt: githubAccount.lastVerifiedAt,
      },
    });
  } catch (error) {
    console.error(`Connect GitHub Error: ${error.message}`);
    const status = error instanceof GithubApiError ? error.status : 500;
    res.status(status).json({
      success: false,
      code: error.code || 'GITHUB_CONNECT_FAILED',
      error: error.message || 'Server error connecting GitHub',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  connectGithub,
};
