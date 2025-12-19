import { IUsersAttributes } from '../../database/models-ts/users.js';

// User domain types - for creating, updating, and retrieving user data ... called on the services layer
export type UserCreationDTO = Omit<IUsersAttributes, 'user_id' | 'created_at' | 'updated_at'>;
export type UserUpdateDTO = Partial<UserCreationDTO>;
export type UserRetrievedDTO = IUsersAttributes;
