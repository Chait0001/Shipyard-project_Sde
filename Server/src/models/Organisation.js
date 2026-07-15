const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Organisation = sequelize.define('Organisation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Please provide an organisation name' },
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  githubOrgName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Organisation;
