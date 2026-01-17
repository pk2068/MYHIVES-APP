import { IUserRepository } from '../interfaces/i-user-repository.js';
import { Users } from '../../database/models-ts/users.js';
import { Roles } from '../../database/models-ts/roles.js';
import { sequelizeInstance as database } from '../../database/connect.js';
import { UserRetrievedDTO, UserUpdateDTO, UserCreationDTO } from '../../services/dto/user-service.dto.js';
import { IUsersAttributes } from '../../database/models-ts/users.js';

// 1. Define an internal type that extends your base attributes with the association
type UserWithRoles = IUsersAttributes & {
  roles_association?: { role_name: string }[];
};

export class UserRepository implements IUserRepository {
  private readonly db = database;

  async create(user: UserCreationDTO): Promise<UserRetrievedDTO> {
    const newUser = await Users.create(user);
    return newUser.toJSON() as UserRetrievedDTO;
  }

  async readById(id: string): Promise<UserRetrievedDTO | null> {
    const user = await Users.findByPk(id, {
      include: [
        {
          model: Roles,
          as: 'roles_association',
          attributes: ['role_name'],
          through: { attributes: [] },
        },
      ],
    });

    return user ? this.mapUserWithRoles(user) : null;
  }

  async readByEmail(email: string): Promise<UserRetrievedDTO | null> {
    const user = await Users.findOne({
      where: { email },
      include: [
        {
          model: Roles,
          as: 'roles_association', // Matches the alias in associations.ts
          attributes: ['role_name'], // Only get the names
          through: { attributes: [] }, // Exclude junction table data
        },
      ],
    });
    return user ? this.mapUserWithRoles(user) : null;
  }

  async readByGoogleId(googleId: string): Promise<UserRetrievedDTO | null> {
    const user = await Users.findOne({
      where: { google_id: googleId },
      include: [
        {
          model: Roles,
          as: 'roles_association',
          attributes: ['role_name'],
          through: { attributes: [] },
        },
      ],
    });

    return user ? this.mapUserWithRoles(user) : null;
  }

  async readAll(): Promise<UserRetrievedDTO[]> {
    const allUsers = await Users.findAll({
      include: [
        {
          model: Roles,
          as: 'roles_association',
          attributes: ['role_name'],
          through: { attributes: [] },
        },
      ],
    });

    return allUsers.map((user) => {
      const userData = user.get({ plain: true }) as UserWithRoles;
      return {
        ...userData,
        roles: userData.roles_association?.map((r) => r.role_name) || [],
      } as UserRetrievedDTO;
    });
  }

  async update(id: string, user: UserUpdateDTO): Promise<[number, UserRetrievedDTO[]]> {
    const transaction = await this.db.transaction();
    try {
      const [updatedCount, updatedUsers] = await Users.update(user, {
        where: { user_id: id },
        returning: true,
        transaction: transaction,
      });

      if (updatedCount > 1) {
        // Rollback if the count is unexpected (the actual fix would be to prevent this query from updating >1 in the first place,
        // but the rollback is the safety net).
        await transaction.rollback();
        throw new Error('Concurrency failure: More than one record updated.');
      }

      // COMMIT if successful
      await transaction.commit();

      return [updatedCount, updatedUsers.map((user) => user.toJSON() as UserRetrievedDTO)];
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async delete(id: string): Promise<number> {
    const deletedCount = await Users.destroy({ where: { user_id: id } });
    return deletedCount;
  }

  //#region Private Methods
  private mapUserWithRoles(user: Users): UserRetrievedDTO {
    const userData = user.get({ plain: true }) as UserWithRoles;
    return {
      ...userData,
      roles: userData.roles_association?.map((r) => r.role_name) || [],
    } as UserRetrievedDTO;
  }
  //#endregion Private Methods
}
