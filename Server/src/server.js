const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { startAutoSyncWorker } = require('./services/autoSyncWorker');

// Load Centralized Models and Associations
const { sequelize } = require('./models');

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
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/v1/github', githubRoutes);
app.use('/api/dashboard', dashboardRoutes);

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

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    startAutoSyncWorker();
  });

  // Sync database models asynchronously
  sequelize.sync()
    .then(() => console.log('Database synced successfully'))
    .catch((err) => console.warn('Database sync warning:', err.message));
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

