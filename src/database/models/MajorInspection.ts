
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { MajorInspection as MajorInspectionInterface } from '../../types/models';

export interface MajorInspectionCreationAttributes extends Optional<MajorInspectionInterface, 'id' | 'createdAt' | 'updatedAt'> {}

export class MajorInspection extends Model<MajorInspectionInterface, MajorInspectionCreationAttributes> implements MajorInspectionInterface {
  public id!: string;
  public locationId!: string; // Foreign key
  public inspectionDate!: Date;
  public notes?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    MajorInspection.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        locationId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'locations', // Refers to the table name 'locations'
            key: 'id',
          },
          onDelete: 'CASCADE', // If a location is deleted, its major inspections are also deleted
        },
        inspectionDate: {
          type: DataTypes.DATEONLY, // Stores only date (YYYY-MM-DD)
          allowNull: false,
        },
        generalNotes: {
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
        tableName: 'major_inspections',
        sequelize,
        timestamps: true,
        underscored: true,
      }
    );
  }
}