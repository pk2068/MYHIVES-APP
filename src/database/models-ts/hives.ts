import { Model, Table, Column, DataType, Index, Sequelize, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { locations } from './locations.js';
import { hive_inspections } from './hive_inspections.js'; // Import hive_inspections model

export interface hivesAttributes {
  hive_id?: string;
  location_id: string;
  hive_name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

@Table({
  tableName: 'hives',
  schema: 'public',
  timestamps: false,
})
export class hives extends Model<hivesAttributes, hivesAttributes> implements hivesAttributes {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
  })
  hive_id?: string;

  @ForeignKey(() => locations) // Indicates that location_id is a foreign key referencing the locations model
  @Column({
    type: DataType.UUID,
  })
  location_id!: string;

  @BelongsTo(() => locations) // This establishes the BelongsTo relationship with locations
  location?: locations; // Property to hold the associated location

  @Column({
    type: DataType.STRING(255),
  })
  hive_name!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  description?: string;

  @Column({
    allowNull: true,
    type: DataType.BOOLEAN,
    defaultValue: Sequelize.literal('true'),
  })
  is_active?: boolean;

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
    foreignKey: 'hive_id', // The foreign key in the 'hive_inspections' table that links back to 'hives'
    as: 'hiveInspections', // Alias for when you include hive inspections with a hive
  })
  hiveInspections?: hive_inspections[]; // Property to hold an array of associated hive inspections
}
