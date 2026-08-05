const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  githubIssueId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  githubIssueNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  state: {
    type: DataTypes.ENUM('open', 'closed'),
    allowNull: false,
    defaultValue: 'open',
  },
  labels: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: [],
  },
  authorGithubUsername: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  authorGithubId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assigneeGithubUsername: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  assigneeGithubId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  githubCreatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  githubUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  githubClosedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  parentIssueId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  indexes: [
    {
      fields: ['projectId'],
    },
    {
      fields: ['githubRepositoryId'],
    },
    {
      fields: ['assigneeGithubUsername'],
    },
  ],
});

module.exports = Issue;
