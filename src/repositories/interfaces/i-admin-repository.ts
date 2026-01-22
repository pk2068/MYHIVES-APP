import { RoleCreateDTO, RoleRetrievedDTO, AdminUserRetrievedDTO, UserRoleLinkDTO, UserRoleRetrievedDTO } from '../../services/dto/admin-role-service.dto.js';

export interface IAdminRepository {
  // Role Management
  createRole(data: RoleCreateDTO): Promise<RoleRetrievedDTO>;
  findAllRoles(): Promise<RoleRetrievedDTO[]>;

  // User Management
  findAllUsersWithRoles(): Promise<AdminUserRetrievedDTO[]>;

  // User-Role Management (Composite Key logic)
  assignRoleToUser(link: UserRoleLinkDTO): Promise<UserRoleRetrievedDTO>;
  removeUserRole(userId: string, roleId: string): Promise<boolean>;
}
