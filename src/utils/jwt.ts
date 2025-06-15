// src/utils/jwt.ts

import jwt from 'jsonwebtoken';
import config from '../config'; // Import your application configuration

interface JwtPayload {
  userId: string;
  // Add any other user-specific data you want to include in the token payload
  // e.g., email: string; username: string; roles: string[];
}

/**
 * Generates a JWT token for a given user ID.
 * @param userId The ID of the user.
 * @returns A signed JWT token string.
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '1h', // Token expires in 1 hour
  });
};

/**
 * Verifies a JWT token.
 * @param token The JWT token string.
 * @returns The decoded payload if valid, otherwise throws an error.
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    // jwt.verify returns the payload if verification is successful.
    // We cast it to our JwtPayload interface.
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    // If verification fails (e.g., token expired, invalid signature), an error is thrown.
    // Re-throw to be caught by calling middleware/controller.
    throw new Error('Invalid or expired token.');
  }
};