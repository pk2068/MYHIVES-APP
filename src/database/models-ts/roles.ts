import { Model, Table, Column, DataType, BelongsToMany } from 'sequelize-typescript';
import { Users } from './users.js';
import { UserRoles } from './user_roles.js';

export interface IRoleAttributes {
  role_id?: number;
  role_name: string;
  description?: string;
}

@Table({
  tableName: 'roles',
  schema: 'public',
  timestamps: false,
})
export class Roles extends Model<IRoleAttributes, IRoleAttributes> implements IRoleAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
  })
  declare role_id?: number;

  @Column({
    type: DataType.STRING(50),
    unique: true,
    allowNull: false,
  })
  declare role_name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare description?: string;

  //@BelongsToMany(() => Users, () => UserRoles)
  declare users?: Users[];
}
