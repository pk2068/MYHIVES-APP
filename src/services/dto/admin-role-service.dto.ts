import { Attributes } from 'sequelize';
import { IUsersAttributes } from '../../database/models-ts/users.js';
import { Roles } from '../../database/models-ts/roles.js';
import { UserRoles } from '../../database/models-ts/user_roles.js';

// --- Role Domain ---
// Derive Role DTOs directly from the Roles model class
export type RoleRetrievedDTO = Attributes<Roles>;
export type RoleCreateDTO = Omit<RoleRetrievedDTO, 'role_id'>;

// --- User Management Domain  ---
export interface AdminUserRetrievedDTO extends Omit<IUsersAttributes, 'password_hash' | 'roles'> {
  // We keep the detailed objects for the admin view
  roles: RoleRetrievedDTO[];
}

// --- User-Role Junction Domain ---
export type UserRoleRetrievedDTO = Attributes<UserRoles>;
export type UserRoleLinkDTO = Pick<UserRoleRetrievedDTO, 'user_id' | 'role_id'>;
