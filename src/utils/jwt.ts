// src/utils/jwt.ts

import jwt from 'jsonwebtoken';
import config from '../config/index.js'; // Import your application configuration

interface JwtPayload {
  userId: string;
  username: string;
  roles: string;
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
    expiresIn: config.tokenExpiry as any, // Token expires in 8 days
  });
};

// Access Token: Short-lived for API calls
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.tokenExpiry as any });
};

// Refresh Token: Long-lived to get new access tokens
export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.refreshTokenSecret, { expiresIn: config.refreshTokenExpiry as any });
};

export const verifyAccessToken = (token: string) => jwt.verify(token, config.jwtSecret) as JwtPayload;
export const verifyRefreshToken = (token: string) => jwt.verify(token, config.refreshTokenSecret) as JwtPayload;

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

export const calculateTokenExpiry = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as { exp: number } | null;

    if (decoded && typeof decoded.exp === 'number') {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const secondsUntilExpiry = decoded.exp - currentTime;
      return secondsUntilExpiry;
    }
    return null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
