const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Load Models
const User = require('./models/User');
const Organisation = require('./models/Organisation');
const Department = require('./models/Department');
const Team = require('./models/Team');
const Project = require('./models/Project');

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

const { clerkMiddleware } = require('@clerk/express');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const githubRoutes = require('./routes/githubRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/v1/github', githubRoutes);

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
  await connectDB.sequelize.sync({ alter: true });
  console.log('Database synced successfully');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
