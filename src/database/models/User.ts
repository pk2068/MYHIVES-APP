// src/database/models/User.ts

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User as UserInterface } from '../../types/models.js'; // Corrected the path

// Define a type for the attributes that are allowed for creation
export interface UserCreationAttributes extends Optional<UserInterface, 'id' | 'createdAt' | 'updatedAt'> {}

// Extend the Sequelize Model for your User model
export class User extends Model<UserInterface, UserCreationAttributes> implements UserInterface {
  public id!: string;
  public googleId?: string | null;
  public linkedinId?: string | null;
  public username?: string | null;
  public email!: string;
  public password?: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        googleId: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: true,
        },
        linkedinId: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: true,
        },
        username: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING, // Hashed password
          allowNull: true,
        },
        // --- ADDED THESE TIMESTAMP FIELDS FOR TYPESCRIPT ---
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        // --- END ADDED FIELDS ---
      },
      {
        tableName: 'users',
        sequelize, // Pass the sequelize instance
        timestamps: true, 
        underscored: true,
      }
    );
  }
}