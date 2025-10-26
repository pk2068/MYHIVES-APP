import { Sequelize } from 'sequelize-typescript';
//import { Sequelize } from 'sequelize';
import config from '../config/index.js';
//import { associateModels } from './models-obsolete/associations.js'; // obsolete associations
//import { User } from './models-obsolete/User.js'; // To be created
import { users } from './models-ts/users.js'; // To be created
import { locations } from './models-ts/locations.js'; // To be created
import { hive_inspections } from './models-ts/hive_inspections.js';
import { major_inspections } from './models-ts/major_inspections.js';
import { hives } from './models-ts/hives.js'; // To be created
import { associateModels } from './models-ts/associations.js'; // Adjust path if you placed it elsewhere, e.g., './models-obsolete/associations.js'

// import { Location } from './models-obsolete/Location.js'; // To be created
// import { MajorInspection } from './models-obsolete/MajorInspection.js'; // To be created
// import { HiveInspection } from './models-obsolete/HiveInspection.js'; // To be created

console.log('Connecting to PostgreSQL database... ', process.env.DATABASE_URL);

const DB_DIALECT = process.env.DB_DIALECT as 'postgres'; // Cast to ensure correct type
const DB_HOST = process.env.DB_HOST as string;
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER as string;
const DB_PASSWORD = process.env.DB_PASSWORD as string;
const DB_NAME = process.env.DB_NAME as string;

// Ensure all required environment variables are present
if (!DB_DIALECT || !DB_HOST || !DB_USER || !DB_NAME) {
  console.error('Missing one or more database environment variables!');
  // Optionally, throw an error to stop the application from starting
  // throw new Error('Database configuration incomplete.');
}

// Construct the database connection string
const databaseUrl = `${DB_DIALECT}://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
console.log('Database connection string:', databaseUrl);

// Initialize Sequelize with your database connection string<br>
const sequelize = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: false, // Enable logging to see SQL queries
  models: [users, locations, hive_inspections, major_inspections, hives], // Add all models here
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  // Required for proper PostgreSQL UUID handling
  dialectOptions: {
    useUTC: false,
  },
  timezone: '+00:00', // Set timezone to UTC for consistency
});

// Initialize Sequelize with your database connection string
// export const sequelize = new Sequelize({
//   //dialect: DB_DIALECT, // Specify PostgreSQL dialect
//   //host: DB_HOST,
//   //port: DB_PORT,
//   database: DB_NAME,
//   username: DB_USER,
//   password: DB_PASSWORD,

//   //logging: config.nodeEnv === 'development' ? console.log : false, // Log SQL queries in dev mode
//   logging: false,
//   dialectOptions: {
//     // You might need these options for production deployments like Heroku or Render
//     // ssl: {
//     //   require: true,
//     //   rejectUnauthorized: false, // For self-signed certificates or services like Heroku
//     // },
//   },
//   define: {
//     timestamps: false, // Automatically add createdAt and updatedAt fields
//     underscored: true, // Use snake_case for column names (e.g., created_at)
//   },
//   models: [users, locations, hive_inspections, major_inspections, hives], // Register your models
// });

export const connectDB = async () => {
  try {
    console.log('PostgreSQL connection trying.');
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');

    // Set up associations between models
    associateModels();
    // Sync all models with the database.
    // In production, you'd typically use migrations (e.g., `sequelize-cli`)
    // `alter: true` is good for development but can cause data loss in production.
    if (config.nodeEnv === 'development') {
      console.log('Syncing database models (development mode)...');
      //await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
      await sequelize.sync({ alter: false });
      console.log('Database models synchronized.');
    } else {
      // In production, rely on migrations. If you haven't run migrations,
      // you might still want a simple sync without alter.
      // Or remove this line entirely if you strictly use migrations.
      // await sequelize.sync();
      console.log('In production, use database migrations to manage schema changes.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit process if database connection fails
  }
};
