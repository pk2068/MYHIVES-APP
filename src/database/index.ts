
import { Sequelize } from 'sequelize';
import config from '../config';
import { associateModels } from './models/associations'; // To be created
import { User } from './models/User'; // To be created
import { Location } from './models/Location'; // To be created
import { MajorInspection } from './models/MajorInspection'; // To be created
import { HiveInspection } from './models/HiveInspection'; // To be created

// Initialize Sequelize with your database connection string
const sequelize = new Sequelize(config.databaseUrl, {
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
        await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
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

export { sequelize }; // Export sequelize instance for use in models/controllers