import { UserService } from '../../../src/services/user-service.ts';
import { MockUserRepository } from '../mocks/MockUserRepository.ts'; // Assuming you put the mock in a /mocks folder
import { IUserRepository } from '../../../src/repositories/interfaces/i-user-repository.ts';
import { UserCreationDTO, UserUpdateDTO, UserRetrievedDTO } from '../../../src/services/dto/user-service.dto.ts';
import httpStatus from 'http-status';
import { beforeEach, describe, it, expect, jest } from '@jest/globals';

// Mock data
const mockUser: UserRetrievedDTO = MockUserRepository.mockUser;
const mockUserId: string = MockUserRepository.mockUserId;
const newUserEmail = 'new.user@example.com';

// Mock instance setup
let mockUserRepository: MockUserRepository;
let userService: UserService;

// Setup before each test
beforeEach(() => {
  // Create a clean mock instance before every test
  mockUserRepository = MockUserRepository.createMockInstance();

  // Inject the mock instance into the UserService
  userService = new UserService(mockUserRepository as IUserRepository);

  // Clear mock history before each test to ensure tests are isolated
  jest.clearAllMocks();
});

describe('UserService', () => {
  // --- findUserByEmail tests ---
  describe('findUserByEmail', () => {
    it('should return a user if found by email', async () => {
      // Arrange
      mockUserRepository.readByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findUserByEmail(mockUser.email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.readByEmail).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.readByEmail).toHaveBeenCalledWith(mockUser.email);
    });

    it('should return null if no user is found by email', async () => {
      // Arrange
      mockUserRepository.readByEmail.mockResolvedValue(null);

      // Act
      const result = await userService.findUserByEmail(newUserEmail);

      // Assert
      expect(result).toBeNull();
    });
  });

  // --- findUserById tests ---
  describe('findUserById', () => {
    it('should return a user if found by ID', async () => {
      // Arrange
      mockUserRepository.readById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.findUserById(mockUserId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.readById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.readById).toHaveBeenCalledWith(mockUserId);
    });

    it('should return null if no user is found by ID', async () => {
      // Arrange
      mockUserRepository.readById.mockResolvedValue(null);

      // Act
      const result = await userService.findUserById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  // --- createUser tests ---
  describe('createUser', () => {
    const newUser: UserCreationDTO = {
      username: 'NewGuy',
      email: newUserEmail,
      password_hash: 'newHashedPass',
    };
    const createdUser: UserRetrievedDTO = {
      ...mockUser,
      ...newUser,
      user_id: 'new-user-id',
    };

    it('should successfully create a new user if email is unique', async () => {
      // Arrange
      // 1. readByEmail returns null (user does not exist)
      mockUserRepository.readByEmail.mockResolvedValueOnce(null);
      // 2. create returns the new user object
      mockUserRepository.create.mockResolvedValueOnce(createdUser);

      // Act
      const result = await userService.createUser(newUser);

      // Assert
      expect(result).toEqual(createdUser);
      expect(mockUserRepository.readByEmail).toHaveBeenCalledWith(newUser.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(newUser);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw CONFLICT error if user with email already exists', async () => {
      // Arrange
      // 1. readByEmail returns an existing user object (user exists)
      mockUserRepository.readByEmail.mockResolvedValueOnce(mockUser);

      // Act & Assert
      await expect(userService.createUser(newUser)).rejects.toMatchObject({
        message: 'User with this email already exists.',
        statusCode: httpStatus.CONFLICT, // 409
      });

      // Assert that create was never called
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  // --- updateUser tests ---
  describe('updateUser', () => {
    const updateData: Partial<UserUpdateDTO> = { username: 'UpdatedName' };
    const updatedUser: UserRetrievedDTO = { ...mockUser, username: 'UpdatedName' };

    it('should successfully update an existing user', async () => {
      // Arrange
      // 1. readById returns existing user
      mockUserRepository.readById.mockResolvedValueOnce(mockUser);
      // 2. update returns success tuple
      mockUserRepository.update.mockResolvedValueOnce([1, [updatedUser]]);

      // Act
      const result = await userService.updateUser(mockUserId, updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.readById).toHaveBeenCalledWith(mockUserId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUserId, updateData);
    });

    it('should throw NOT_FOUND error if user ID does not exist (pre-check)', async () => {
      // Arrange
      // 1. readById returns null
      mockUserRepository.readById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(userService.updateUser(mockUserId, updateData)).rejects.toMatchObject({
        message: 'User not found.',
        statusCode: httpStatus.NOT_FOUND, // 404
      });
      // Assert that update was never called
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw INTERNAL_SERVER_ERROR if repository updates > 1 user', async () => {
      // Arrange
      // 1. readById returns existing user
      mockUserRepository.readById.mockResolvedValueOnce(mockUser);
      // 2. update returns unexpected count (2 users updated)
      mockUserRepository.update.mockResolvedValueOnce([2, [updatedUser, updatedUser]]);

      // Act & Assert
      await expect(userService.updateUser(mockUserId, updateData)).rejects.toMatchObject({
        message: expect.stringContaining('Failed to update user with ID'),
        statusCode: httpStatus.INTERNAL_SERVER_ERROR, // 500
      });
    });

    it('should throw NOT_FOUND error if repository returns updated count of 0', async () => {
      // Arrange
      // 1. readById returns existing user
      mockUserRepository.readById.mockResolvedValueOnce(mockUser);
      // 2. update returns 0 count (should not happen after pre-check, but testing robust code)
      mockUserRepository.update.mockResolvedValueOnce([0, []]);

      // Act & Assert
      await expect(userService.updateUser(mockUserId, updateData)).rejects.toMatchObject({
        message: expect.stringContaining(`User with ID ${mockUserId} not found`), // Assuming ID is not the mockUserId for this test path
        statusCode: httpStatus.NOT_FOUND, // 404
      });
    });
  });
});
