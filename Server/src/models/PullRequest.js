const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PullRequest = sequelize.define('PullRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  externalPullRequestId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'merged'),
    allowNull: false,
    defaultValue: 'open',
  },
  githubUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  githubCreatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  githubUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  linkedIssueNumbers: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['githubRepositoryId', 'externalPullRequestId'],
    },
    {
      fields: ['projectId'],
    },
  ],
});

module.exports = PullRequest;
