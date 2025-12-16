import { Model, Table, Column, DataType, Index, Sequelize, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Users } from './users.js';
// import { hives } from './hives.js'; // Import hives model
// import { major_inspections } from './major_inspections.js'; // Import major_inspections model

export interface locationsAttributes {
  location_id?: string;
  user_id: string;
  name: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  country?: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

@Table({
  tableName: 'locations',
  schema: 'public',
  timestamps: false,
})
export class Locations extends Model<locationsAttributes, locationsAttributes> implements locationsAttributes {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
  })
  location_id?: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
  })
  user_id!: string;

  @Column({
    type: DataType.STRING(255),
  })
  name!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(500),
  })
  address?: string;

  @Column({
    allowNull: true,
    type: DataType.DECIMAL(9, 6),
  })
  latitude?: string;

  @Column({
    allowNull: true,
    type: DataType.DECIMAL(9, 6),
  })
  longitude?: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(100),
  })
  country?: string;

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  notes?: string;

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

  // Association with users model
  //   @BelongsTo(() => users)
  //   user?: users; // This property would hold the associated user object

  // --- Associations for Hives ---
  //   @HasMany(() => hives, {
  //     foreignKey: 'location_id', // The foreign key in the 'hives' table that links back to 'locations'
  //     as: 'hives', // Alias for when you include hives with a location
  //   })
  //   hives?: hives[]; // Property to hold an array of associated hives

  // --- Associations for Major Inspections ---
  //   @HasMany(() => major_inspections, {
  //     foreignKey: 'location_id', // The foreign key in the 'major_inspections' table that links back to 'locations'
  //     as: 'majorInspections', // Alias for when you include major inspections with a location
  //   })
  //   majorInspections?: major_inspections[]; // Property to hold an array of associated major inspections
}
