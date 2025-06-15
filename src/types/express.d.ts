// src/types/express.d.ts
// This file extends the Express Request interface to include a user property.

// eslint-disable-next-line no-unused-vars
declare namespace Express {
    interface Request {
      user?: {
        id: string; // The user ID from the JWT payload
        // Add other properties if you include them in JwtPayload and need them on req.user
        // email?: string;
        // username?: string;
      };
    }
  }