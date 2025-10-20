// Import the interface and DTOs to ensure the mock signature is correct
//import { IUserRepository } from '../../../src/repositories/interfaces/IUserRepository.js';
import { IUserRepository } from '../../../src/repositories/interfaces/IUserRepository.js';
import { UserRetrievedDTO, UserCreationDTO, UserUpdateDTO } from '../../../src/types/DTO/per-controller/user-dto.js';

// Implement the interface with Jest mock functions
export class MockUserRepository implements IUserRepository {
  // Use jest.fn() for methods you want to track or control
  readByEmail = jest.fn<Promise<UserRetrievedDTO | null>, [string]>();
  readById = jest.fn<Promise<UserRetrievedDTO | null>, [number]>();
  create = jest.fn<Promise<UserRetrievedDTO>, [UserCreationDTO]>();
  readAll = jest.fn<Promise<UserRetrievedDTO[]>, []>();
  update = jest.fn<Promise<[number, UserRetrievedDTO[]]>, [number, UserUpdateDTO]>();
  delete = jest.fn<Promise<number>, [number]>();
}
