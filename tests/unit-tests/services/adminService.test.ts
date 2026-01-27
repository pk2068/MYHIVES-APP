// filepath: tests/unit-tests/services/adminService.test.ts
import { AdminService } from '../../../src/services/admin-service.ts';
import { MockAdminRepository } from '../mocks/MockAdminRepository.ts';
import { AdminUserRetrievedDTO, RoleRetrievedDTO, UserRoleLinkDTO, UserRoleRetrievedDTO } from '../../../src/services/dto/admin-role-service.dto.ts';
import { jest } from '@jest/globals';
//import { mock } from 'node:test';

describe('AdminService - Full Suite', () => {
  let adminService: AdminService;
  let mockRepo: MockAdminRepository;

  const mockUserId = 'user-uuid-123';
  const mockRoleId = 456;

  beforeEach(() => {
    mockRepo = MockAdminRepository.createMockInstance();
    adminService = new AdminService(mockRepo);
  });

  // =========================================================================
  // BLOCK 1: THE OK CASES (Happy Path)
  // =========================================================================
  describe('Positive Scenarios (OK)', () => {
    // role creation
    it('should successfully create a new role and return the DTO', async () => {
      // arrange
      const roleData = { role_name: 'inspector', description: 'Can create inspections' };
      const expected: RoleRetrievedDTO = { role_id: 10, ...roleData };
      mockRepo.createRole.mockResolvedValueOnce(expected);

      // act
      const result = await adminService.createRole(roleData);

      // assert
      expect(result).toEqual(expected);
      expect(mockRepo.createRole).toHaveBeenCalledWith(roleData);
      expect(mockRepo.createRole).toHaveBeenCalledTimes(1);
    });

    // get all users with roles
    it('should retrieve the full list of users for the dashboard', async () => {
      // arrange
      const mockUsers: AdminUserRetrievedDTO[] = [
        {
          user_id: mockUserId,
          username: 'tonyclark',
          email: 'tony@test.com',
          created_at: new Date(),
          roles: [
            { role_id: 1, role_name: 'admin', description: 'Admin' },
            { role_id: 2, role_name: 'user', description: 'Regular User' },
          ],
        },
      ];
      mockRepo.findAllUsersWithRoles.mockResolvedValueOnce(mockUsers);

      // act
      const result = await adminService.getUsersDashboardData();

      // assert
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('tonyclark');
      expect(mockRepo.findAllUsersWithRoles).toHaveBeenCalledTimes(1);
    });

    // assign role to user
    it('should link a role to a user successfully', async () => {
      // arrange
      const linkData = { user_id: mockUserId, role_id: mockRoleId };
      const expected: UserRoleRetrievedDTO = { id: 99, ...linkData };
      mockRepo.assignRoleToUser.mockResolvedValueOnce(expected);

      // act
      const result = await adminService.assignRoleToUser(linkData);

      // assert
      expect(result).toEqual(expected);
      expect(result.user_id).toBe(mockUserId);
      expect(mockRepo.assignRoleToUser).toHaveBeenCalledWith(linkData);
      expect(mockRepo.assignRoleToUser).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // BLOCK 2: THE NEGATIVE CASES (Error Handling)
  // =========================================================================
  describe('Negative Scenarios (Errors)', () => {
    // create role error
    it('should propagate database connection errors when creating a role', async () => {
      // arrange
      const dbError = new Error('Database Connection Failed');
      mockRepo.createRole.mockRejectedValueOnce(dbError);

      // act & assert
      await expect(adminService.createRole({ role_name: 'test' })).rejects.toThrow('Database Connection Failed');
    });

    // assign role to user error
    it('should throw an error if the repository fails during role assignment', async () => {
      // arrange
      mockRepo.assignRoleToUser.mockRejectedValueOnce(new Error('Foreign Key Constraint Violation'));

      // act & assert
      await expect(adminService.assignRoleToUser({ user_id: 'bad-id', role_id: 999 })).rejects.toThrow('Foreign Key Constraint Violation');
    });

    // remove role from user error
    it('should return false if the repository fails to delete a role assignment', async () => {
      // Simulate the scenario where the DB is fine, but the record didn't exist to delete
      mockRepo.removeUserRole.mockResolvedValueOnce(false);

      const result = await adminService.removeRoleFromUser(mockUserId, mockUserId ? mockRoleId.toString() : '-1');

      expect(result).toBe(false);
      expect(mockRepo.removeUserRole).toHaveBeenCalledWith(mockUserId, mockRoleId.toString());
    });
  });

  // =========================================================================
  // BLOCK 3: THE EDGE CASES (Boundary Conditions)
  // =========================================================================
  describe('Edge Case Scenarios', () => {
    // get all roles when none exist
    it('should return an empty array if no roles exist in the system', async () => {
      mockRepo.findAllRoles.mockResolvedValueOnce([]);

      const result = await adminService.getAllRoles();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(mockRepo.findAllRoles).toHaveBeenCalledTimes(1);
      expect(mockRepo.findAllRoles).toHaveReturnedTimes(1);
    });

    // get user details for non-existent user
    it('should return null if searching for a user that does not exist', async () => {
      mockRepo.findUserById.mockResolvedValueOnce(null);

      const result = await adminService.getUserDetails('non-existent-uuid');

      expect(result).toBeNull();
      expect(mockRepo.findUserById).toHaveBeenCalledWith('non-existent-uuid');
      expect(mockRepo.findUserById).toHaveBeenCalledTimes(1);
      expect(mockRepo.findAllUsersWithRoles).toHaveReturnedTimes(0);
      expect(mockRepo.findAllUsersWithRoles).not.toHaveBeenCalled();
      expect(mockRepo.findAllUsersWithRoles).toHaveBeenCalledTimes(0);
    });

    // get user details for user with no roles
    it('should correctly handle a user with an empty roles array', async () => {
      const userWithoutRoles: AdminUserRetrievedDTO = {
        user_id: mockUserId,
        username: 'new_user',
        email: 'new@test.com',
        created_at: new Date(),
        roles: [], // Edge case: User exists but has no roles
      };
      mockRepo.findUserById.mockResolvedValueOnce(userWithoutRoles);

      const result = await adminService.getUserDetails(mockUserId);

      expect(result).toEqual(userWithoutRoles);
      expect(result?.user_id).toBe(mockUserId);
      expect(result?.roles).toEqual([]);
      expect(result?.roles).toHaveLength(0);
    });
  });

  describe('Additional Tests for Coverage', () => {
    it('should successfully remove a role from a user', async () => {
      // arrange
      mockRepo.removeUserRole.mockResolvedValueOnce(true);
      // act
      const result = await adminService.removeRoleFromUser(mockUserId, mockRoleId.toString());

      // assert
      expect(result).toBe(true);
      expect(mockRepo.removeUserRole).toHaveBeenCalledWith(mockUserId, mockRoleId.toString());
      expect(mockRepo.removeUserRole).toHaveBeenCalledTimes(1);
    });

    // =========================================================================
    // BLOCK 1: POSITIVE SCENARIOS (OK) - All 6 methods success paths
    // =========================================================================
    describe('Positive Scenarios (OK)', () => {
      it('1. createRole: should successfully create and return a new role', async () => {
        const data = { role_name: 'vet', description: 'Veterinary access' };
        const expected: RoleRetrievedDTO = { role_id: 1, ...data };
        mockRepo.createRole.mockResolvedValueOnce(expected);
        const result = await adminService.createRole(data);
        expect(result.role_id).toBe(1);
        expect(result.role_name).toBe('vet');
        expect(mockRepo.createRole).toHaveBeenCalledWith(data);
        expect(result).toEqual(expected);
      });

      it('2. getAllRoles: should return a list of all system roles', async () => {
        mockRepo.findAllRoles.mockResolvedValueOnce([{ role_id: 1, role_name: 'admin' } as RoleRetrievedDTO]);
        const result = await adminService.getAllRoles();
        expect(result).toHaveLength(1);
      });

      it('3. getUsersDashboardData: should return all users with their roles', async () => {
        const expected: AdminUserRetrievedDTO[] = [
          {
            user_id: mockUserId,
            username: 'tonyclark',
            email: 'tonyclark@example.com',
            created_at: new Date(),
            roles: [{ role_id: 1, role_name: 'admin', description: 'Administrator' }],
          },
        ];
        mockRepo.findAllUsersWithRoles.mockResolvedValueOnce(expected);
        const result = await adminService.getUsersDashboardData();
        expect(result[0].username).toBe('tonyclark');
        expect(result).toHaveLength(1);
        expect(result).toEqual(expected);
        expect(mockRepo.findAllUsersWithRoles).toHaveBeenCalledTimes(1);
      });

      it('4. getUserDetails: should return specific user data by ID', async () => {
        const expected: AdminUserRetrievedDTO = {
          user_id: mockUserId,
          username: 'testuser',
          email: 'testuser@example.com',
          roles: [{ role_id: 1, role_name: 'admin', description: 'Administrator' }],
        };
        mockRepo.findUserById.mockResolvedValueOnce(expected);
        const result = await adminService.getUserDetails(mockUserId);
        expect(result?.user_id).toBe(mockUserId);
        expect(result).toEqual(expected);
      });

      it('5. assignRoleToUser: should link a role to a user successfully', async () => {
        const inputdata: UserRoleLinkDTO = { user_id: mockUserId, role_id: mockRoleId };
        const expected: UserRoleRetrievedDTO = { id: 99, ...inputdata };
        mockRepo.assignRoleToUser.mockResolvedValueOnce(expected);
        const result = await adminService.assignRoleToUser(inputdata);

        expect(result.role_id).toBe(mockRoleId);
        expect(result).toEqual(expected);
        expect(mockRepo.assignRoleToUser).toHaveBeenCalledWith(inputdata);
      });

      it('6. removeRoleFromUser: should return true when unlinking a role', async () => {
        mockRepo.removeUserRole.mockResolvedValueOnce(true);
        const result = await adminService.removeRoleFromUser(mockUserId, String(mockRoleId));
        expect(result).toBe(true);
        expect(mockRepo.removeUserRole).toHaveBeenCalledWith(mockUserId, String(mockRoleId));
      });
    });

    // =========================================================================
    // BLOCK 2: NEGATIVE SCENARIOS (Errors) - All 6 methods failure paths
    // =========================================================================
    describe('Negative Scenarios (Errors)', () => {
      it('7. createRole: should throw if database unique constraint fails', async () => {
        mockRepo.createRole.mockRejectedValueOnce(new Error('Duplicate role'));
        await expect(adminService.createRole({ role_name: 'admin' })).rejects.toThrow('Duplicate role');
      });

      it('8. getAllRoles: should propagate database connection errors', async () => {
        mockRepo.findAllRoles.mockRejectedValueOnce(new Error('DB Down'));
        await expect(adminService.getAllRoles()).rejects.toThrow('DB Down');
      });

      it('9. getUsersDashboardData: should throw if dashboard query times out', async () => {
        mockRepo.findAllUsersWithRoles.mockRejectedValueOnce(new Error('Timeout'));
        await expect(adminService.getUsersDashboardData()).rejects.toThrow('Timeout');
      });

      it('10. getUserDetails: should throw if ID format is invalid for DB', async () => {
        mockRepo.findUserById.mockRejectedValueOnce(new Error('Invalid UUID'));
        await expect(adminService.getUserDetails('not-a-uuid')).rejects.toThrow('Invalid UUID');
      });

      it('11. assignRoleToUser: should throw if role_id does not exist', async () => {
        mockRepo.assignRoleToUser.mockRejectedValueOnce(new Error('FK Violation'));
        await expect(adminService.assignRoleToUser({ user_id: mockUserId, role_id: 999 })).rejects.toThrow('FK Violation');
      });

      it('12. removeRoleFromUser: should return false if record not found to delete', async () => {
        mockRepo.removeUserRole.mockResolvedValueOnce(false);
        const result = await adminService.removeRoleFromUser(mockUserId, '1');
        expect(result).toBe(false);
      });
    });

    // =========================================================================
    // BLOCK 3: EDGE CASES (Boundary) - Unexpected but valid states
    // =========================================================================
    describe('Edge Case Scenarios', () => {
      it('13. createRole: should handle very long role descriptions', async () => {
        const longDesc = 'a'.repeat(500);
        mockRepo.createRole.mockResolvedValueOnce({ role_id: 1, description: longDesc } as RoleRetrievedDTO);
        const result = await adminService.createRole({ role_name: 'test', description: longDesc });
        expect(result.description).toHaveLength(500);
      });

      it('14. getAllRoles: should return an empty array if system is fresh/new', async () => {
        mockRepo.findAllRoles.mockResolvedValueOnce([]);
        const result = await adminService.getAllRoles();
        expect(result).toEqual([]);
      });

      it('15. getUsersDashboardData: should handle a system with zero registered users', async () => {
        mockRepo.findAllUsersWithRoles.mockResolvedValueOnce([]);
        const result = await adminService.getUsersDashboardData();
        expect(result).toHaveLength(0);
      });

      it('16. getUserDetails: should return null if user does not exist', async () => {
        mockRepo.findUserById.mockResolvedValueOnce(null);
        const result = await adminService.getUserDetails('empty-id');
        expect(result).toBeNull();
      });

      it('17. assignRoleToUser: should handle re-assigning an existing role', async () => {
        // Logic check: does your DB findOrCreate or throw? Assuming repo handles it.
        mockRepo.assignRoleToUser.mockResolvedValueOnce({ id: 10, role_id: mockRoleId } as UserRoleRetrievedDTO);
        const result = await adminService.assignRoleToUser({ user_id: mockUserId, role_id: mockRoleId });
        expect(result.id).toBe(10);
      });

      it('18. removeRoleFromUser: should handle IDs that are already null/missing', async () => {
        mockRepo.removeUserRole.mockResolvedValueOnce(false);
        const result = await adminService.removeRoleFromUser('', '0');
        expect(result).toBe(false);
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
});
