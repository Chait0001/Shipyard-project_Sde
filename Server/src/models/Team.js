const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide a team name' },
    },
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['organisationId', 'name'],
    },
  ],
});

module.exports = Team;
