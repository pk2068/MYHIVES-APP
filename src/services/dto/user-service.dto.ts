import { usersAttributes } from '../../database/models-ts/users.js';

// User domain types - for creating, updating, and retrieving user data ... called on the services layer
export type UserCreationDTO = Omit<usersAttributes, 'user_id' | 'created_at' | 'updated_at' | 'google_id' | 'linkedin_id'>;
export type UserUpdateDTO = Partial<UserCreationDTO>;
export type UserRetrievedDTO = Omit<usersAttributes, 'google_id' | 'linkedin_id'>;
