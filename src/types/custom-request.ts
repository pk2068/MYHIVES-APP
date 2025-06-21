// src/types/custom-request.ts
import { Request } from 'express';
import { User as UserInterface } from './models.js'; // Assuming your User interface is here

// Extend the Express Request type to include the 'user' property
interface AuthenticatedUser extends Omit<UserInterface, 'password'> {} // Optionally omit password for security

export interface CustomRequest extends Request {
  user?: AuthenticatedUser; // The authenticated user's details
}