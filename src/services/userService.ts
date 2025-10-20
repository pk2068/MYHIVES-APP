//import { usersAttributes } from '../database/models-ts/users.js'; // Importing the type for user creation attributes
import { IUserRepository } from '../repositories/implementations/UserRepository.js'; // The contract
import { UserRetrievedDTO, UserCreationDTO, UserUpdateDTO } from '../types/DTO/per-controller/user-dto.js'; // The data shapes
import { CustomError } from '../middleware/errorHandler.js';
import httpStatus from 'http-status';

// This class handles business logic (e.g., uniqueness check, error handling). No direct access to DB, just through repository.
export class UserService {
  private readonly userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public async findUserByEmail(email: string): Promise<UserRetrievedDTO | null> {
    return this.userRepository.readByEmail(email);
  }

  public async findUserById(id: string): Promise<UserRetrievedDTO | null> {
    return this.userRepository.readById(id);
  }

  public async createUser(userData: UserCreationDTO): Promise<UserRetrievedDTO> {
    // Check if user already exists (Business Logic)
    const existingUser = await this.userRepository.readByEmail(userData.email);
    if (existingUser) {
      // Throw a specific error that the Controller/ErrorHandler can catch
      const error = new Error('User with this email already exists.') as CustomError;
      error.statusCode = httpStatus.CONFLICT; // 409
      throw error;
    }

    // Delegate the creation to the repository (Data Access)
    return this.userRepository.create(userData);
  }

  public async updateUser(id: string, userData: Partial<UserUpdateDTO>): Promise<UserRetrievedDTO> {
    // Check if user exists
    const existingUser = await this.userRepository.readById(id);
    if (!existingUser) {
      const error = new Error('User not found.') as CustomError;
      error.statusCode = httpStatus.NOT_FOUND; // 404
      throw error;
    }

    // Delegate the update to the repository (Data Access)
    const [updatedCount, updatedUsers] = await this.userRepository.update(id, userData);

    if (updatedCount > 1) {
      const error = new Error(`Failed to update user with ID ${id}.`) as CustomError;
      error.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      throw error;
    }
    if (updatedCount === 0) {
      const error = new Error(`User with ID ${id} not found.`) as CustomError;
      error.statusCode = httpStatus.NOT_FOUND;
      throw error;
    }

    return updatedUsers[0]; // decide for later if you want to return array or single object
  }
}
