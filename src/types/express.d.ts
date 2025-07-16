import { usersAttributes } from '../database/models-ts/users.js';

declare global {
  namespace Express {
    // Define the shape of the authenticated user object that will be attached to req.user.
    // This interface merges your usersAttributes with the Express.User expectation of an 'id' property.
    interface DedicatedUser {
      id: string; // The required 'id' property, which will be populated by usersAttributes.user_id
    }

    // Extend the Request interface to correctly type the 'user' property.
    interface Request {
      currentUser?: DedicatedUser; // Use the newly defined 'User' interface for req.user
    }
  }
}
