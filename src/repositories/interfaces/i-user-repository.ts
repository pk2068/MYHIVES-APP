// import { users } from '../../database/models-ts/users.js';
import { UserRetrievedDTO, UserUpdateDTO, UserCreationDTO } from '../../services/dto/user-service.dto.js';

export interface IUserRepository {
  create(user: UserCreationDTO): Promise<UserRetrievedDTO>;
  readById(id: string): Promise<UserRetrievedDTO | null>;
  readByEmail(email: string): Promise<UserRetrievedDTO | null>;
  readAll(): Promise<UserRetrievedDTO[]>;
  update(id: string, user: UserUpdateDTO): Promise<[number, UserRetrievedDTO[]]>;
  delete(id: string): Promise<number>;

  readByGoogleId(googleId: string): Promise<UserRetrievedDTO | null>;
}
