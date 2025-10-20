import { IUserRepository } from '../interfaces/IUserRepository.js';
import { users } from '../../database/models-ts/users.js';
import { UserRetrievedDTO, UserUpdateDTO, UserCreationDTO } from 'types/DTO/per-controller/user-dto.js';

export class UserRepository implements IUserRepository {
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
    const [updatedCount, updatedUsers] = await users.update(user, {
      where: { user_id: id },
      returning: true,
    });

    return [updatedCount, updatedUsers.map((user) => user.toJSON() as UserRetrievedDTO)];
  }

  async delete(id: string): Promise<number> {
    const deletedCount = await users.destroy({ where: { user_id: id } });
    return deletedCount;
  }
}
