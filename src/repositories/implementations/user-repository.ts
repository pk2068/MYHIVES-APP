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
    const user = await Users.findByPk(id);
    return user ? (user.toJSON() as UserRetrievedDTO) : null;
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
    //return user ? (user.toJSON() as UserRetrievedDTO) : null;
    if (!user) return null;

    // 1. Convert the Model Instance to a plain JavaScript object immediately
    const userData = user.get({ plain: true }) as UserWithRoles;

    // 2. Map the data from the association alias to the 'roles' property
    const returnData: UserRetrievedDTO = {
      ...userData,
      // Accessing from the plain object is 100% reliable
      roles: userData.roles_association?.map((r: any) => r.role_name) || [],
    };

    // console.log('User with roles retrieved:', returnData.roles);
    // console.log('User with roles_association retrieved:', returnData.roles_association);

    return returnData;
  }

  async readByGoogleId(googleId: string): Promise<UserRetrievedDTO | null> {
    const user = await Users.findOne({ where: { google_id: googleId } });
    return user ? (user.toJSON() as UserRetrievedDTO) : null;
  }

  async readAll(): Promise<UserRetrievedDTO[]> {
    const allUsers = await Users.findAll();
    return allUsers.map((user) => user.toJSON() as UserRetrievedDTO);
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
}
