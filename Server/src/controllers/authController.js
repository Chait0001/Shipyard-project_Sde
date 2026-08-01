const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT containing user id and email
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'shipyard_jwt_secret_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register (or /api/v1/auth/register)
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
        token: generateToken(user),
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
// @route   POST /api/auth/login (or /api/v1/auth/login)
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
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        role: user.role,
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

// @desc    Get currently authenticated user
// @route   GET /api/auth/me (or /api/v1/auth/me)
// @access  Private
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized',
      });
    }

    res.status(200).json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      githubUsername: req.user.githubUsername,
      role: req.user.role,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    console.error(`Get Me Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user profile',
    });
  }
};

// @desc    Authenticate with GitHub OAuth or Clerk login
// @route   POST /api/auth/github (or /api/v1/auth/github)
// @access  Public
const githubAuth = async (req, res) => {
  try {
    const { code, email: passedEmail, name: passedName, githubUsername, avatarUrl } = req.body;

    let email = passedEmail;
    let name = passedName || 'GitHub User';
    let ghUser = githubUsername;
    let avatar = avatarUrl;

    if (code) {
      if (code.startsWith('demo_github_auth_code_')) {
        ghUser = ghUser || 'github_developer';
        name = name || 'GitHub Developer';
        email = email || 'github_developer@example.com';
        avatar = avatar || 'https://avatars.githubusercontent.com/u/9919?v=4';
      } else {
        const client_id = process.env.GITHUB_CLIENT_ID;
        const client_secret = process.env.GITHUB_CLIENT_SECRET;

        if (client_id && client_secret) {
          const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ client_id, client_secret, code }),
          });
          const tokenData = await tokenRes.json();

          if (tokenData.access_token) {
            const userRes = await fetch('https://api.github.com/user', {
              headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'User-Agent': 'Shipyard-App',
              },
            });
            const ghProfile = await userRes.json();

            ghUser = ghProfile.login;
            name = ghProfile.name || ghProfile.login;
            avatar = ghProfile.avatar_url;
            email = ghProfile.email;

            if (!email) {
              const emailRes = await fetch('https://api.github.com/user/emails', {
                headers: {
                  Authorization: `Bearer ${tokenData.access_token}`,
                  'User-Agent': 'Shipyard-App',
                },
              });
              const emails = await emailRes.json();
              if (Array.isArray(emails)) {
                const primaryEmailObj = emails.find((e) => e.primary && e.verified) || emails[0];
                if (primaryEmailObj) email = primaryEmailObj.email;
              }
            }
          }
        }
      }
    }

    if (!email) {
      if (ghUser) {
        email = `${ghUser.toLowerCase()}@users.noreply.github.com`;
      } else if (code) {
        const cleanCode = code.replace(/[^a-zA-Z0-9]/g, '').slice(-8);
        email = `github_dev_${cleanCode}@example.com`;
        ghUser = `github_dev_${cleanCode}`;
        name = 'GitHub Developer';
      } else {
        email = 'github_developer@example.com';
        ghUser = 'github_developer';
        name = 'GitHub Developer';
      }
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name: name || 'GitHub User',
        email,
        githubUsername: ghUser || null,
        avatarUrl: avatar || null,
      });
    } else {
      if (ghUser && !user.githubUsername) user.githubUsername = ghUser;
      if (avatar && !user.avatarUrl) user.avatarUrl = avatar;
      await user.save();
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`GitHub Auth Error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error during GitHub authentication',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  githubAuth,
};
