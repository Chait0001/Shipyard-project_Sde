const { sequelize, Sequelize } = require('../config/db');

const User = require('./User');
const Organisation = require('./Organisation');
const Department = require('./Department');
const Team = require('./Team');
const Project = require('./Project');
const GithubAccount = require('./GithubAccount');
const GithubRepository = require('./GithubRepository');
const PullRequest = require('./PullRequest');

// Define Relationships / Associations

// User <-> Organisation (Owner)
Organisation.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Organisation, { foreignKey: 'ownerId', as: 'ownedOrganisations' });

// User <-> Organisation (Member)
User.belongsTo(Organisation, { foreignKey: 'organisationId' });
Organisation.hasMany(User, { foreignKey: 'organisationId', as: 'members' });

// Department <-> Organisation
Department.belongsTo(Organisation, { foreignKey: 'organisationId' });
Organisation.hasMany(Department, { foreignKey: 'organisationId' });

// Team <-> Organisation
Team.belongsTo(Organisation, { foreignKey: 'organisationId' });
Organisation.hasMany(Team, { foreignKey: 'organisationId' });

// Team <-> Department
Team.belongsTo(Department, { foreignKey: 'departmentId' });
Department.hasMany(Team, { foreignKey: 'departmentId' });

// User <-> Team (Many-to-Many)
User.belongsToMany(Team, { through: 'UserTeams', foreignKey: 'userId', otherKey: 'teamId', as: 'memberTeams' });
Team.belongsToMany(User, { through: 'UserTeams', foreignKey: 'teamId', otherKey: 'userId', as: 'members' });

// Project <-> User (Owner & Creator)
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Project, { foreignKey: 'ownerId', as: 'ownedProjects' });

Project.belongsTo(User, { as: 'creator', foreignKey: 'createdById' });
User.hasMany(Project, { foreignKey: 'createdById', as: 'createdProjects' });

// GithubAccount <-> User
GithubAccount.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(GithubAccount, { foreignKey: 'userId' });

// GithubRepository <-> Project & GithubAccount
GithubRepository.belongsTo(Project, { foreignKey: 'projectId' });
Project.hasMany(GithubRepository, { foreignKey: 'projectId' });

GithubRepository.belongsTo(GithubAccount, { foreignKey: 'githubAccountId' });
GithubAccount.hasMany(GithubRepository, { foreignKey: 'githubAccountId' });

// PullRequest <-> GithubRepository & Project
PullRequest.belongsTo(GithubRepository, { foreignKey: 'githubRepositoryId' });
GithubRepository.hasMany(PullRequest, { foreignKey: 'githubRepositoryId' });

PullRequest.belongsTo(Project, { foreignKey: 'projectId' });
Project.hasMany(PullRequest, { foreignKey: 'projectId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Organisation,
  Department,
  Team,
  Project,
  GithubAccount,
  GithubRepository,
  PullRequest,
};
