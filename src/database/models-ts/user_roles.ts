import { Model, Table, Column, DataType, ForeignKey } from 'sequelize-typescript';
import { Users } from './users.js';
import { Roles } from './roles.js';

@Table({
  tableName: 'user_roles',
  schema: 'public',
  timestamps: true, // Useful for auditing when a role was assigned
  updatedAt: false,
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
}
