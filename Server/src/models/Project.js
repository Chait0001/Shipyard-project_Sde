const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide a project title' },
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed'),
    defaultValue: 'pending',
  },
  githubPrimaryRepoId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  syncStatus: {
    type: DataTypes.ENUM('idle', 'syncing', 'complete', 'partial', 'failed'),
    defaultValue: 'idle',
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  indexes: [
    {
      fields: ['ownerId', 'id'],
    },
  ],
});

module.exports = Project;
