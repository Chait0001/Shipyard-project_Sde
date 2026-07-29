const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide a project title' },
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed'),
    defaultValue: 'pending',
  },
  syncStatus: {
    type: DataTypes.ENUM('pending', 'syncing', 'complete', 'partial', 'failed'),
    defaultValue: 'pending',
  },
  githubPrimaryRepoId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    {
      fields: ['ownerId', 'id'],
    },
    {
      unique: true,
      fields: ['githubPrimaryRepoId'],
    },
  ],
});

module.exports = Project;
