
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Location as LocationInterface } from '../../types/models';

export interface LocationCreationAttributes extends Optional<LocationInterface, 'id' | 'createdAt' | 'updatedAt'> {}

export class Location extends Model<LocationInterface, LocationCreationAttributes> implements LocationInterface {
  public id!: string;
  public userId!: string; // Foreign key
  public name!: string;
  public address!: string;
  public latitude!: number;
  public longitude!: number;
  public description?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    Location.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users', // Refers to the table name 'users'
            key: 'id',
          },
          onDelete: 'CASCADE', // If a user is deleted, their locations are also deleted
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        latitude: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          validate: {
            min: -90,
            max: 90,
          },
        },
        longitude: {
          type: DataTypes.DOUBLE,
          allowNull: false,
          validate: {
            min: -180,
            max: 180,
          },
        },
        description: {
          type: DataTypes.TEXT,
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
        tableName: 'locations',
        sequelize,
        timestamps: true,
        underscored: true,
      }
    );
  }
}