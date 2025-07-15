import { Model, Table, Column, DataType, Index, Sequelize, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';

import { locations } from './locations.js'; // Import locations model
import { hive_inspections } from './hive_inspections.js'; // Import hive_inspections model

export interface major_inspectionsAttributes {
  major_inspection_id?: string;
  location_id: string;
  inspection_date: string;
  general_notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

@Table({
  tableName: 'major_inspections',
  schema: 'public',
  timestamps: false,
})
export class major_inspections extends Model<major_inspectionsAttributes, major_inspectionsAttributes> implements major_inspectionsAttributes {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
  })
  major_inspection_id?: string;

  @ForeignKey(() => locations) // Indicates that location_id is a foreign key referencing the locations model
  @Column({
    type: DataType.UUID,
  })
  location_id!: string;

  @BelongsTo(() => locations) // This establishes the BelongsTo relationship with locations
  location?: locations; // Property to hold the associated location

  @Column({
    type: DataType.STRING,
  })
  inspection_date!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  general_notes?: string;

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

  // --- Associations for Hive Inspections ---
  @HasMany(() => hive_inspections, {
    foreignKey: 'major_inspection_id', // The foreign key in the 'hive_inspections' table that links back to 'major_inspections'
    as: 'hiveInspections', // Alias for when you include hive inspections with a major inspection
  })
  hiveInspections?: hive_inspections;
}
