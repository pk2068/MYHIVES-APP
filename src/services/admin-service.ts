// filepath: src/services/admin-service.ts
import { IAdminRepository } from '../repositories/interfaces/i-admin-repository.js';
import { RoleCreateDTO, RoleRetrievedDTO, AdminUserRetrievedDTO, UserRoleLinkDTO, UserRoleRetrievedDTO } from './dto/admin-role-service.dto.js';

export class AdminService {
  private readonly _adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this._adminRepository = adminRepository;
  }

  // --- Role Management ---

  /**
   * Creates a new role in the system.
   */
  public async createRole(roleData: RoleCreateDTO): Promise<RoleRetrievedDTO> {
    // Business logic: check if role name is unique or perform validation here
    return await this._adminRepository.createRole(roleData);
  }

  /**
   * Retrieves all defined roles.
   */
  public async getAllRoles(): Promise<RoleRetrievedDTO[]> {
    return await this._adminRepository.findAllRoles();
  }

  // --- User Management ---

  /**
   * Retrieves all users along with their assigned roles.
   * This is typically used for the user management dashboard.
   */
  public async getUsersDashboardData(): Promise<AdminUserRetrievedDTO[]> {
    return await this._adminRepository.findAllUsersWithRoles();
  }

  // --- User-Role Junction Management ---

  /**
   * Links a specific role to a user.
   */
  public async assignRoleToUser(assignmentData: UserRoleLinkDTO): Promise<UserRoleRetrievedDTO> {
    // Business logic: check if user exists or if role exists before assigning
    return await this._adminRepository.assignRoleToUser(assignmentData);
  }

  /**
   * Removes a role from a user.
   */
  public async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    return await this._adminRepository.removeUserRole(userId, roleId);
  }
}
