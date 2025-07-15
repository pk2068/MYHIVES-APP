import { usersAttributes } from '../database/models-ts/users.js';

declare global {
  namespace Express {
    // Define the shape of the authenticated user object that will be attached to req.user.
    // This interface merges your usersAttributes with the Express.User expectation of an 'id' property.
    interface User extends Omit<usersAttributes, 'password_hash' | 'user_id'> {
      id: string; // The required 'id' property, which will be populated by usersAttributes.user_id
      user_id: string; // Keep user_id explicitly as well if you need it consistently
    }

    // Extend the Request interface to correctly type the 'user' property.
    interface Request {
      user?: User; // Use the newly defined 'User' interface for req.user
    }
  }
}
