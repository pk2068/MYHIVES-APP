import { Model, Table, Column, DataType, ForeignKey, Sequelize } from 'sequelize-typescript';
import { Users } from './users.js';
import { Roles } from './roles.js';

@Table({
  tableName: 'user_roles',
  schema: 'public',
  timestamps: true, // Useful for auditing when a role was assigned
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export class UserRoles extends Model {
  @ForeignKey(() => Users)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id!: string;

  @ForeignKey(() => Roles)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  role_id!: number;

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
