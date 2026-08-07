const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || 'shipyard_jwt_secret_key_2026';
      const decoded = jwt.verify(token, secret);

      // Get user from the token using id or email, excluding password
      if (decoded.id) {
        req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
      } else if (decoded.email) {
        req.user = await User.findOne({
          where: { email: decoded.email },
          attributes: { exclude: ['password'] },
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found',
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token validation failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
