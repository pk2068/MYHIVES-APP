import { IAdminRepository } from '../interfaces/i-admin-repository.js';
import { Roles } from '../../database/models-ts/roles.js';
import { UserRoles } from '../../database/models-ts/user_roles.js';
import { Users } from '../../database/models-ts/users.js';
import { RoleCreateDTO, RoleRetrievedDTO, UserRoleLinkDTO, UserRoleRetrievedDTO, AdminUserRetrievedDTO } from '../../services/dto/admin-role-service.dto.js';

export class AdminRepository implements IAdminRepository {
  // ... constructor with DB injection ...

  async createRole(data: RoleCreateDTO): Promise<RoleRetrievedDTO> {
    const role = await Roles.create(data);
    return role.toJSON() as unknown as RoleRetrievedDTO;
  }

  async assignRoleToUser(link: UserRoleLinkDTO): Promise<UserRoleRetrievedDTO> {
    const assignment = await UserRoles.create({
      user_id: link.user_id,
      role_id: link.role_id,
    });
    return assignment.toJSON() as UserRoleRetrievedDTO;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const deletedCount = await UserRoles.destroy({
      where: {
        user_id: userId,
        role_id: roleId,
      },
    });
    return deletedCount > 0;
  }

  async findAllUsersWithRoles(): Promise<AdminUserRetrievedDTO[]> {
    const users = await Users.findAll({
      include: [
        {
          model: Roles,
          as: 'roles', // Matches the association name in your model
          through: { attributes: [] }, // Hide junction table columns in final output
        },
      ],
    });
    //return users.map((u) => u.toJSON() as AdminUserRetrievedDTO);

    return users.map((user) => {
      const userData = user.get({ plain: true });

      return {
        user_id: userData.user_id,
        username: userData.username,
        email: userData.email,
        created_at: userData.created_at,
        // Manually map the roles to ensure they match RoleRetrievedDTO[]
        roles: (userData.roles || []).map((role: Roles) => ({
          role_id: role.role_id,
          role_name: role.role_name,
          description: role.description,
        })),
      };
    });
  }
}
