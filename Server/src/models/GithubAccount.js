const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GithubAccount = sequelize.define('GithubAccount', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  githubUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  githubLogin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accessToken: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  scopes: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  connectedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  lastVerifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId'],
    },
    {
      unique: true,
      fields: ['githubUserId'],
    },
  ],
});

module.exports = GithubAccount;
