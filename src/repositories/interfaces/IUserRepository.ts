// import { users } from '../../database/models-ts/users.js';
import { UserRetrievedDTO, UserUpdateDTO, UserCreationDTO } from 'types/DTO/per-controller/user-dto.js';

export interface IUserRepository {
  create(user: UserCreationDTO): Promise<UserRetrievedDTO>;
  readById(id: string): Promise<UserRetrievedDTO | null>;
  readByEmail(email: string): Promise<UserRetrievedDTO | null>;
  readAll(): Promise<UserRetrievedDTO[]>;
  update(id: string, user: UserUpdateDTO): Promise<[number, UserRetrievedDTO[]]>;
  delete(id: string): Promise<number>;
}
