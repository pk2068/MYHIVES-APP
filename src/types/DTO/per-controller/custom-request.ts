// src/types/custom-request.ts
import { Request } from 'express';
import { IUsersAttributes } from '#database/models-ts/users.js';

// Extend the Express Request type to include the 'user' property
interface AuthenticatedUser extends Omit<IUsersAttributes, 'password_hash'> {} // Optionally omit password for security

export interface CustomRequest extends Request {
  // user?: AuthenticatedUser; // The authenticated user's details
}
