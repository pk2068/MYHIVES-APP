import { IUserRepository } from '../interfaces/i-user-repository.js';
import { users } from '../../database/models-ts/users.js';
import { sequelizeInstance as database } from '../../database/connect.js';
import { UserRetrievedDTO, UserUpdateDTO, UserCreationDTO } from '../../services/dto/user-service.dto.js';

export class UserRepository implements IUserRepository {
  private readonly db = database;

  async create(user: UserCreationDTO): Promise<UserRetrievedDTO> {
    const newUser = await users.create(user);
    return newUser.toJSON() as UserRetrievedDTO;
  }

  async readById(id: string): Promise<UserRetrievedDTO | null> {
    const user = await users.findByPk(id);
    return user ? (user.toJSON() as UserRetrievedDTO) : null;
  }

  async readByEmail(email: string): Promise<UserRetrievedDTO | null> {
    const user = await users.findOne({ where: { email } });
    return user ? (user.toJSON() as UserRetrievedDTO) : null;
  }

  async readAll(): Promise<UserRetrievedDTO[]> {
    const allUsers = await users.findAll();
    return allUsers.map((user) => user.toJSON() as UserRetrievedDTO);
  }

  async update(id: string, user: UserUpdateDTO): Promise<[number, UserRetrievedDTO[]]> {
    const transaction = await this.db.transaction();
    try {
      const [updatedCount, updatedUsers] = await users.update(user, {
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
    const deletedCount = await users.destroy({ where: { user_id: id } });
    return deletedCount;
  }
}
