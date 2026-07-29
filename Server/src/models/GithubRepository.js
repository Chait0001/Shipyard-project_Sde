const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GithubRepository = sequelize.define('GithubRepository', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  externalRepoId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  defaultBranch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'internal'),
    allowNull: false,
    defaultValue: 'private',
  },
  githubUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['externalRepoId'],
    },
    {
      unique: true,
      fields: ['owner', 'name'],
    },
  ],
});

module.exports = GithubRepository;
