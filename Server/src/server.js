const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { startAutoSyncWorker } = require('./services/autoSyncWorker');

// Load Models
const User = require('./models/User');
const Organisation = require('./models/Organisation');
const Department = require('./models/Department');
const Team = require('./models/Team');
const Project = require('./models/Project');
const GithubAccount = require('./models/GithubAccount');
const GithubRepository = require('./models/GithubRepository');
const PullRequest = require('./models/PullRequest');
const Issue = require('./models/Issue');

// Define Relationships/Associations
// User <-> Organisation (Owner)
Organisation.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Organisation, { foreignKey: 'ownerId' });

// User <-> Organisation (Member)
User.belongsTo(Organisation, { foreignKey: 'organisationId' });
Organisation.hasMany(User, { foreignKey: 'organisationId' });

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

// Project <-> User (Owner)
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
User.hasMany(Project, { foreignKey: 'ownerId' });

// Project <-> User (Creator)
Project.belongsTo(User, { as: 'creator', foreignKey: 'createdById' });
User.hasMany(Project, { foreignKey: 'createdById', as: 'createdProjects' });

// User <-> GitHub account
GithubAccount.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(GithubAccount, { foreignKey: 'userId', as: 'githubAccount', onDelete: 'CASCADE' });

// Project <-> GitHub repositories
GithubRepository.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Project.hasMany(GithubRepository, { foreignKey: 'projectId', as: 'githubRepositories', onDelete: 'CASCADE' });
GithubRepository.belongsTo(GithubAccount, { foreignKey: 'githubAccountId', onDelete: 'SET NULL' });
GithubAccount.hasMany(GithubRepository, { foreignKey: 'githubAccountId', as: 'repositories' });

// Pull requests synced from GitHub
PullRequest.belongsTo(Project, { foreignKey: 'projectId', as: 'project', onDelete: 'CASCADE' });
Project.hasMany(PullRequest, { foreignKey: 'projectId', as: 'pullRequests', onDelete: 'CASCADE' });
PullRequest.belongsTo(GithubRepository, { foreignKey: 'githubRepositoryId', as: 'githubRepository', onDelete: 'CASCADE' });
GithubRepository.hasMany(PullRequest, { foreignKey: 'githubRepositoryId', as: 'pullRequests', onDelete: 'CASCADE' });

// Issues synced from GitHub
Issue.belongsTo(Project, { foreignKey: 'projectId', as: 'project', onDelete: 'CASCADE' });
Project.hasMany(Issue, { foreignKey: 'projectId', as: 'issues', onDelete: 'CASCADE' });
Issue.belongsTo(GithubRepository, { foreignKey: 'githubRepositoryId', as: 'githubRepository', onDelete: 'CASCADE' });
GithubRepository.hasMany(Issue, { foreignKey: 'githubRepositoryId', as: 'issues', onDelete: 'CASCADE' });

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start DB and Express Server
const startServer = async () => {
  // Connect to Database
  await connectDB();
  
  // Sync database models
  await connectDB.sequelize.sync();
  console.log('Database synced successfully');

  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    startAutoSyncWorker();
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
