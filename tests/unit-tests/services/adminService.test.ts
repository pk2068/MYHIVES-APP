// filepath: tests/unit-tests/services/adminService.test.ts
import { AdminService } from '../../../src/services/admin-service.ts';
import { MockAdminRepository } from '../mocks/MockAdminRepository.ts';
import { AdminUserRetrievedDTO, RoleRetrievedDTO, UserRoleRetrievedDTO } from '../../../src/services/dto/admin-role-service.dto.ts';

describe('AdminService', () => {
  let adminService: AdminService;
  let mockRepo: MockAdminRepository;

  const mockUserId = 'user-123';
  const mockRoleId = 'role-456';

  beforeEach(() => {
    mockRepo = MockAdminRepository.createMockInstance();
    adminService = new AdminService(mockRepo);
  });

  describe('Role Management', () => {
    it('should successfully create a new role', async () => {
      const roleData = { role_name: 'manager', description: 'Manages hives' };
      const expectedResponse: RoleRetrievedDTO = { role_id: 1, ...roleData };

      mockRepo.createRole.mockResolvedValueOnce(expectedResponse);

      const result = await adminService.createRole(roleData);

      expect(result).toEqual(expectedResponse);
      expect(mockRepo.createRole).toHaveBeenCalledWith(roleData);
    });

    it('should retrieve all defined roles', async () => {
      const mockRoles: RoleRetrievedDTO[] = [
        { role_id: 1, role_name: 'admin', description: 'desc' },
        { role_id: 2, role_name: 'user', description: 'desc' },
      ];
      mockRepo.findAllRoles.mockResolvedValueOnce(mockRoles);

      const result = await adminService.getAllRoles();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockRoles);
    });
  });

  describe('User & Dashboard Management', () => {
    it('should retrieve dashboard data (users with roles)', async () => {
      const mockDashboard: AdminUserRetrievedDTO[] = [
        {
          user_id: mockUserId,
          username: 'tonyclark',
          email: 'tony@test.com',
          created_at: new Date(),
          roles: [{ role_id: 1, role_name: 'admin', description: 'desc' }],
        },
      ];
      mockRepo.findAllUsersWithRoles.mockResolvedValueOnce(mockDashboard);

      const result = await adminService.getUsersDashboardData();

      expect(result).toEqual(mockDashboard);
      expect(mockRepo.findAllUsersWithRoles).toHaveBeenCalledTimes(1);
    });

    it('should return user details with roles for a specific ID', async () => {
      const mockUser: AdminUserRetrievedDTO = {
        user_id: mockUserId,
        username: 'tony',
        email: 'tony@test.com',
        created_at: new Date(),
        roles: [],
      };
      mockRepo.findUserById.mockResolvedValueOnce(mockUser);

      const result = await adminService.getUserDetails(mockUserId);

      expect(result).toEqual(mockUser);
      expect(mockRepo.findUserById).toHaveBeenCalledWith(mockUserId);
    });

    it('should return null when getting details for a non-existent user', async () => {
      mockRepo.findUserById.mockResolvedValueOnce(null);

      const result = await adminService.getUserDetails('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('User-Role Junction Management', () => {
    it('should assign a role to a user', async () => {
      const linkData = { user_id: mockUserId, role_id: mockRoleId };
      const mockAssignment: UserRoleRetrievedDTO = { id: 'link-99', ...linkData };

      mockRepo.assignRoleToUser.mockResolvedValueOnce(mockAssignment);

      const result = await adminService.assignRoleToUser(linkData);

      expect(result).toEqual(mockAssignment);
      expect(mockRepo.assignRoleToUser).toHaveBeenCalledWith(linkData);
    });

    it('should return true when a role is successfully removed from a user', async () => {
      mockRepo.removeUserRole.mockResolvedValueOnce(true);

      const result = await adminService.removeRoleFromUser(mockUserId, mockRoleId);

      expect(result).toBe(true);
      expect(mockRepo.removeUserRole).toHaveBeenCalledWith(mockUserId, mockRoleId);
    });

    it('should return false if attempting to remove a role that is not assigned', async () => {
      mockRepo.removeUserRole.mockResolvedValueOnce(false);

      const result = await adminService.removeRoleFromUser(mockUserId, 'unassigned-role');

      expect(result).toBe(false);
    });
  });
});
