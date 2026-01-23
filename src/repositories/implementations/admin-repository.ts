// filepath: src/repositories/implementations/admin-repository.ts
import { Sequelize } from 'sequelize';
import { IAdminRepository } from '../interfaces/i-admin-repository.js';
import { Users } from '../../database/models-ts/users.js';
import { Roles } from '../../database/models-ts/roles.js';
import { UserRoles } from '../../database/models-ts/user_roles.js';
import { RoleCreateDTO, RoleRetrievedDTO, AdminUserRetrievedDTO, UserRoleLinkDTO, UserRoleRetrievedDTO } from '../../services/dto/admin-role-service.dto.js';

export class AdminRepository implements IAdminRepository {
  private readonly db: Sequelize;

  constructor(db: Sequelize) {
    this.db = db;
  }

  // --- Role Management ---

  async createRole(data: RoleCreateDTO): Promise<RoleRetrievedDTO> {
    const role = await Roles.create(data);
    return role.get({ plain: true }) as RoleRetrievedDTO;
  }

  async findAllRoles(): Promise<RoleRetrievedDTO[]> {
    const roles = await Roles.findAll();
    return roles.map((role) => role.get({ plain: true }) as RoleRetrievedDTO);
  }

  // --- User Management ---

  async findAllUsersWithRoles(): Promise<AdminUserRetrievedDTO[]> {
    const users = await Users.findAll({
      include: [
        {
          model: Roles,
          as: 'roles', // Must match the association name in your Users model
          through: { attributes: [] }, // Exclude junction table fields from the 'roles' array
        },
      ],
    });

    return users.map((user) => {
      // Use any here to handle the mismatch between model attributes and included associations
      const userData = user.get({ plain: true }) as any;

      return {
        user_id: userData.user_id!,
        username: userData.username,
        email: userData.email,
        created_at: userData.created_at!,
        // Map the included Roles models to RoleRetrievedDTO
        roles: (userData.roles || []).map(
          (role: any): RoleRetrievedDTO => ({
            role_id: role.role_id,
            role_name: role.role_name,
            description: role.description,
          })
        ),
      };
    });
  }

  // --- User-Role Management ---

  async assignRoleToUser(link: UserRoleLinkDTO): Promise<UserRoleRetrievedDTO> {
    // findOrCreate prevents duplicate entries if the user already has the role
    const [assignment] = await UserRoles.findOrCreate({
      where: {
        user_id: link.user_id,
        role_id: link.role_id,
      },
    });

    return assignment.get({ plain: true }) as UserRoleRetrievedDTO;
  }

  async removeUserRole(userId: string, roleId: string): Promise<boolean> {
    const deletedCount = await UserRoles.destroy({
      where: {
        user_id: userId,
        role_id: roleId,
      },
    });

    return deletedCount > 0;
  }
}
