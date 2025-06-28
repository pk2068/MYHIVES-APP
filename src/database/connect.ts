
import { Sequelize } from 'sequelize';
import config from '../config/index.js';
import { associateModels } from './models/associations.js'; // To be created
import { User } from './models/User.js'; // To be created
import { Location } from './models/Location.js'; // To be created
import { MajorInspection } from './models/MajorInspection.js'; // To be created
import { HiveInspection } from './models/HiveInspection.js'; // To be created


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


// Initialize Sequelize with your database connection string
export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres', // Specify PostgreSQL dialect
  logging: config.nodeEnv === 'development' ? console.log : false, // Log SQL queries in dev mode
  dialectOptions: {
    // You might need these options for production deployments like Heroku or Render
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false, // For self-signed certificates or services like Heroku
    // },
  },
  define: {
    timestamps: true, // Automatically add createdAt and updatedAt fields
    underscored: true, // Use snake_case for column names (e.g., created_at)
  },
});

export const connectDB = async () => {
  try {
    console.log('PostgreSQL connection trying.');
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');

    // Initialize models
    User.initialize(sequelize);
    Location.initialize(sequelize);
    MajorInspection.initialize(sequelize);
    HiveInspection.initialize(sequelize);

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

