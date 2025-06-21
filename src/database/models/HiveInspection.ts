import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import {
  HiveInspection as HiveInspectionInterface,
  ColonyHealthStatus,
  QueenStatus,
  TreatmentApplied,
  QueenCellStatus,
  BeehiveConfiguration,
} from '../../types/models.js';

export interface HiveInspectionCreationAttributes extends Optional<HiveInspectionInterface, 'id' | 'createdAt' | 'updatedAt'> {}

export class HiveInspection extends Model<HiveInspectionInterface, HiveInspectionCreationAttributes> implements HiveInspectionInterface {
  public id!: string;
  public majorInspectionId!: string; // Foreign key
  public hiveNumber!: string;
  public inspectionHour!: string;
  public colonyHealthStatus!: ColonyHealthStatus;
  public numberOfChambers!: number;
  public amountOfBrood!: string;
  public queenStatus!: QueenStatus;
  public approximateAmountOfHoney!: string;
  public amountOfDroneComb!: string;
  public sugarFeedAdded!: boolean;
  public sugarFeedQuantity?: string | null;
  public beehiveConfiguration!: BeehiveConfiguration; // Stored as JSONB
  public numberOfVarroaMitesFound!: number;
  public varroaTreatment!: boolean;
  public treatmentApplied?: TreatmentApplied | null;
  public dosageAmount?: string | null;
  public raisingNewQueen!: boolean;
  public queenCellAge?: number | null;
  public queenCellStatus?: QueenCellStatus | null;
  public otherNotes?: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    HiveInspection.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        majorInspectionId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'major_inspections', // Refers to the table name 'major_inspections'
            key: 'id',
          },
          onDelete: 'CASCADE', // If a major inspection is deleted, its hive inspections are also deleted
        },
        hiveNumber: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        inspectionHour: {
          type: DataTypes.STRING(5), // e.g., "10:30"
          allowNull: false,
        },
        colonyHealthStatus: {
          type: DataTypes.ENUM(...Object.values(ColonyHealthStatus)),
          allowNull: false,
        },
        numberOfChambers: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        amountOfBrood: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        queenStatus: {
          type: DataTypes.ENUM(...Object.values(QueenStatus)),
          allowNull: false,
        },
        approximateAmountOfHoney: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        amountOfDroneComb: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        sugarFeedAdded: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        sugarFeedQuantity: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        beehiveConfiguration: {
          type: DataTypes.JSONB, // Store as JSONB for structured data
          allowNull: false,
        },
        numberOfVarroaMitesFound: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        varroaTreatment: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        treatmentApplied: {
          type: DataTypes.ENUM(...Object.values(TreatmentApplied)),
          allowNull: true,
        },
        dosageAmount: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        raisingNewQueen: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        queenCellAge: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        queenCellStatus: {
          type: DataTypes.ENUM(...Object.values(QueenCellStatus)),
          allowNull: true,
        },
        otherNotes: {
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
        tableName: 'hive_inspections',
        sequelize,
        timestamps: true,
        underscored: true,
      }
    );
  }
}