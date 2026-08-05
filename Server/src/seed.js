const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/db');

// Load Centralized Models and Associations
const { User, Project } = require('./models');

const runSeed = async () => {
  await connectDB();
  
  // Force sync to clear and recreate all tables
  await connectDB.sequelize.sync({ force: true });
  console.log('Database synced (all tables cleared).');
  
  // Seed Users
  const users = await User.bulkCreate([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Organisation Admin',
    },
    {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'Engineer',
    },
    {
      name: 'sushant',
      email: 'sushant@gmail.com',
      password: 'password123',
      role: 'Engineering Manager',
    }
  ], { individualHooks: true });
  
  console.log('Seeded 3 users successfully.');
  
  // Find user IDs
  const adminUser = users.find(u => u.email === 'admin@example.com');
  const testUser = users.find(u => u.email === 'test@example.com');
  const sushantUser = users.find(u => u.email === 'sushant@gmail.com');
  
  // Seed Projects for adminUser
  await Project.bulkCreate([
    {
      title: 'Kubernetes Cluster Migration',
      description: 'Migrating legacy build runners from self-hosted VM scale sets to managed Google Kubernetes Engine (GKE) clusters.',
      status: 'active',
      ownerId: adminUser.id,
    },
    {
      title: 'GitHub Actions CI Optimization',
      description: 'Implement artifact caching and parallel execution structures to reduce median PR build times from 18m to under 5m.',
      status: 'completed',
      ownerId: adminUser.id,
    },
    {
      title: 'Secret Management Isolation',
      description: 'Establish HashiCorp Vault server integration with double-envelope encryption keys for build credential isolation.',
      status: 'pending',
      ownerId: adminUser.id,
    }
  ]);

  // Seed Projects for testUser
  await Project.bulkCreate([
    {
      title: 'Microservices Deployment pipeline',
      description: 'Stateless API deploy automation with Helm charts and automated canary releases using ArgoCD.',
      status: 'active',
      ownerId: testUser.id,
    },
    {
      title: 'Dependency Vulnerability Audit',
      description: 'Integrated Snyk dependency scanning in pull request workflows to prevent container image vulnerabilities in production.',
      status: 'completed',
      ownerId: testUser.id,
    }
  ]);

  // Seed Projects for sushantUser
  await Project.bulkCreate([
    {
      title: 'Shipyard Console Bootstrap',
      description: 'Initial deployment console setup, environment configurations, and MERN-to-PostgreSQL database refactoring.',
      status: 'completed',
      ownerId: sushantUser.id,
    },
    {
      title: 'Real-Time Logging Pipeline',
      description: 'Implement backend WebSocket streaming for active build runner stdout/stderr log extraction.',
      status: 'active',
      ownerId: sushantUser.id,
    },
    {
      title: 'Billing and Analytics Console',
      description: 'Track compute usage, active container hours, and cluster network ingress/egress costs for finance auditing.',
      status: 'pending',
      ownerId: sushantUser.id,
    }
  ]);

  console.log('Seeded all demo projects successfully.');
  process.exit(0);
};

runSeed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
