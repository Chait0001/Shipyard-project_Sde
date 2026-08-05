require('dotenv').config();
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/shipyard';
const isPostgres = databaseUrl.startsWith('postgres');

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: isPostgres ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {},
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected successfully via Sequelize');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

connectDB.sequelize = sequelize;

module.exports = connectDB;
