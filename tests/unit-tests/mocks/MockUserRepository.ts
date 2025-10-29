// Import the interface and DTOs to ensure the mock signature is correct
//import { IUserRepository } from '../../../src/repositories/interfaces/IUserRepository.js';
import { IUserRepository } from '../../../src/repositories/interfaces/IUserRepository.js';
import { UserRetrievedDTO, UserCreationDTO, UserUpdateDTO } from '../../../src/types/DTO/per-controller/user-dto.js';
import { jest } from '@jest/globals';

// Define the shape of a mock user for testing purposes
const mockUser: UserRetrievedDTO = {
  user_id: 'test-uuid-123',
  username: 'TestUser',
  email: 'test@example.com',
  password_hash: 'hashedPassword123',
  created_at: new Date(),
  updated_at: new Date(),
};

// Implement the interface with Jest mock functions
export class MockUserRepository implements IUserRepository {
  // Use jest.fn() for methods you want to track or control

  // readByEmail must return Promise<UserRetrievedDTO | null>
  readByEmail: jest.MockedFunction<(email: string) => Promise<UserRetrievedDTO | null>> = jest.fn();

  readById: jest.MockedFunction<(id: string) => Promise<UserRetrievedDTO | null>> = jest.fn();

  create: jest.MockedFunction<(data: UserCreationDTO) => Promise<UserRetrievedDTO>> = jest.fn();

  readAll: jest.MockedFunction<() => Promise<UserRetrievedDTO[]>> = jest.fn();

  update: jest.MockedFunction<(id: string, data: UserUpdateDTO) => Promise<[number, UserRetrievedDTO[]]>> = jest.fn();

  delete: jest.MockedFunction<(id: string) => Promise<number>> = jest.fn();

  // Helper properties and methods for test setup
  public static mockUser = mockUser;
  public static mockUserId: string = mockUser.user_id as string;

  // Use a factory method to create an instance and set default behaviors (optional, but clean)
  public static createMockInstance(): MockUserRepository {
    const mockRepo = new MockUserRepository();

    // Default mock implementation: always resolve with the mock user
    mockRepo.readById.mockResolvedValue(MockUserRepository.mockUser);
    mockRepo.readByEmail.mockResolvedValue(null); // Default to not finding a user by email to allow creation tests
    mockRepo.create.mockImplementation((userData: UserCreationDTO) => Promise.resolve({ ...MockUserRepository.mockUser, ...userData, user_id: 'new-id-' + Math.random() }));
    mockRepo.update.mockResolvedValue([1, [MockUserRepository.mockUser]]);
    mockRepo.delete.mockResolvedValue(1);

    return mockRepo;
  }
}
