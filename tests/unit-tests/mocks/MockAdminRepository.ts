// filepath: test/unit-test/mocks/MockAdminRepository.ts
import { jest } from '@jest/globals';
import { IAdminRepository } from '../../../src/repositories/interfaces/i-admin-repository.js';
import { RoleCreateDTO, RoleRetrievedDTO, AdminUserRetrievedDTO, UserRoleLinkDTO, UserRoleRetrievedDTO } from '../../../src/services/dto/admin-role-service.dto.js';

export class MockAdminRepository implements IAdminRepository {
  // --- Role Management ---
  createRole: jest.MockedFunction<(data: RoleCreateDTO) => Promise<RoleRetrievedDTO>> = jest.fn();
  findAllRoles: jest.MockedFunction<() => Promise<RoleRetrievedDTO[]>> = jest.fn();

  // --- User Management ---
  findAllUsersWithRoles: jest.MockedFunction<() => Promise<AdminUserRetrievedDTO[]>> = jest.fn();
  findUserById: jest.MockedFunction<(id: string) => Promise<AdminUserRetrievedDTO | null>> = jest.fn();

  // --- User-Role Management ---
  assignRoleToUser: jest.MockedFunction<(link: UserRoleLinkDTO) => Promise<UserRoleRetrievedDTO>> = jest.fn();
  removeUserRole: jest.MockedFunction<(userId: string, roleId: string) => Promise<boolean>> = jest.fn();

  /**
   * Static helper to create a fresh instance of the mock repository.
   * Beneficial for keeping tests isolated.
   */
  public static createMockInstance(): MockAdminRepository {
    return new MockAdminRepository();
  }

  /**
   * Helper to reset all mocks in the instance to their initial state.
   */
  public resetAllMocks(): void {
    this.createRole.mockReset();
    this.findAllRoles.mockReset();
    this.findAllUsersWithRoles.mockReset();
    this.findUserById.mockReset();
    this.assignRoleToUser.mockReset();
    this.removeUserRole.mockReset();
  }
}
