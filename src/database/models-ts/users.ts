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
  user_id?: string;

  @Column({
    type: DataType.STRING(255),
  })
  username!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
  })
  password_hash?: string;

  @Column({
    type: DataType.STRING(255),
  })
  email!: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
  })
  google_id?: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
  })
  linkedin_id?: string;

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

  /*
	// Association with locations model
	@HasMany(() => locations, { foreignKey: 'user_id' })
    locations?: locations[]; // This property would hold an array of associated locations
	*/
  //@BelongsToMany(() => Roles, () => UserRoles)
  declare roles_association?: Roles[];

  roles?: string[];
}
