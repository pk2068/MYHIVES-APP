import { Model, Table, Column, DataType, Index, Sequelize } from 'sequelize-typescript';
// import { Locations } from './locations.js';
// import { UserRoles } from './user_roles.js';
import { Roles } from './roles.js';

export interface IUsersAttributes {
  user_id?: string;
  username: string;
  password_hash?: string;
  email: string;
  google_id?: string;
  linkedin_id?: string;
  created_at?: Date;
  updated_at?: Date;
  roles?: string[];
}

@Table({
  tableName: 'users',
  schema: 'public',
  timestamps: false,
})
export class Users extends Model<IUsersAttributes, IUsersAttributes> implements IUsersAttributes {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
  })
  declare public user_id?: string;

  @Column({
    type: DataType.STRING(255),
  })
  declare public username: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
  })
  declare public password_hash?: string;

  @Column({
    type: DataType.STRING(255),
  })
  declare public email: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
  })
  declare public google_id?: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
  })
  declare public linkedin_id?: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare public created_at?: Date;

  @Column({
    allowNull: true,
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare public updated_at?: Date;

  /*
	// Association with locations model
	@HasMany(() => locations, { foreignKey: 'user_id' })
    locations?: locations[]; // This property would hold an array of associated locations
	*/
  //@BelongsToMany(() => Roles, () => UserRoles)
  declare public roles_association?: Roles[];

  roles?: string[];
}
