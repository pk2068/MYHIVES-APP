import { Model, Table, Column, DataType, Index, Sequelize, ForeignKey, BelongsTo } from 'sequelize-typescript';

import { hives } from './hives.js'; // Import hives model
import { major_inspections } from './major_inspections.js'; // Import major_inspections model

export interface hive_inspectionsAttributes {
  hive_inspection_id?: string;
  major_inspection_id: string;
  hive_id: string;
  inspection_time: string;
  colony_health_status_id: number;
  num_chambers: number;
  brood_frames_count?: number;
  brood_percentage?: string;
  queen_status_id: number;
  approx_honey_weight_kg?: string;
  drone_comb_frames_count?: number;
  drone_comb_percentage?: string;
  sugar_feed_added?: boolean;
  sugar_feed_quantity_kg?: string;
  brood_chambers_count: number;
  supers_count: number;
  queen_excluder_present?: boolean;
  num_varroa_mites_found?: number;
  varroa_treatment_id?: number;
  varroa_treatment_dosage?: string;
  raising_new_queen?: boolean;
  queen_cell_age_days?: number;
  queen_cell_status_id?: number;
  other_notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

@Table({
  tableName: 'hive_inspections',
  schema: 'public',
  timestamps: false,
})
export class hive_inspections extends Model<hive_inspectionsAttributes, hive_inspectionsAttributes> implements hive_inspectionsAttributes {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
  })
  hive_inspection_id?: string;

  @ForeignKey(() => major_inspections) // Indicates that major_inspection_id is a foreign key
  @Column({
    type: DataType.UUID,
  })
  major_inspection_id!: string;

  @BelongsTo(() => major_inspections, {
    foreignKey: 'major_inspection_id',
    as: 'majorInspection', // This alias is consistent with what you used in HiveInspectionService
  })
  majorInspection?: major_inspections; // Property to hold the associated major inspection

  @ForeignKey(() => hives) // Indicates that hive_id is a foreign key
  @Column({
    type: DataType.UUID,
  })
  hive_id!: string;

  @BelongsTo(() => hives, {
    foreignKey: 'hive_id',
    as: 'hive', // Alias for when you include the hive with a hive inspection
  })
  hive?: hives; // Property to hold the associated hive

  @Column({
    type: DataType.STRING,
  })
  inspection_time!: string;

  @Column({
    type: DataType.INTEGER,
  })
  colony_health_status_id!: number;

  @Column({
    type: DataType.INTEGER,
  })
  num_chambers!: number;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  brood_frames_count?: number;

  @Column({
    allowNull: true,
    type: DataType.DECIMAL(5, 2),
  })
  brood_percentage?: string;

  @Column({
    type: DataType.INTEGER,
  })
  queen_status_id!: number;

  @Column({
    allowNull: true,
    type: DataType.DECIMAL(8, 2),
  })
  approx_honey_weight_kg?: string;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  drone_comb_frames_count?: number;

  @Column({
    allowNull: true,
    type: DataType.DECIMAL(5, 2),
  })
  drone_comb_percentage?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: Sequelize.literal('false'),
  })
  sugar_feed_added?: boolean;

  @Column({
    allowNull: true,
    type: DataType.DECIMAL(8, 2),
  })
  sugar_feed_quantity_kg?: string;

  @Column({
    type: DataType.INTEGER,
  })
  brood_chambers_count!: number;

  @Column({
    type: DataType.INTEGER,
  })
  supers_count!: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: Sequelize.literal('false'),
  })
  queen_excluder_present?: boolean;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  num_varroa_mites_found?: number;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  varroa_treatment_id?: number;

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
  })
  varroa_treatment_dosage?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: Sequelize.literal('false'),
  })
  raising_new_queen?: boolean;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  queen_cell_age_days?: number;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  queen_cell_status_id?: number;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  other_notes?: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  created_at?: Date;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  updated_at?: Date;
}
