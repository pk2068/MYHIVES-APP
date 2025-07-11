import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { CustomError } from '../middleware/errorHandler.js';
import { UserService } from '../services/userService.js'; // New service

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserService.findUserByEmail(email);
    if (existingUser) {
      const error = new Error('User with this email already exists.') as CustomError;
      error.statusCode = 409; // Conflict
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create user
    const newUser = await UserService.createUser({
      username,
      email,
      password_hash: hashedPassword,
    });

    // Generate token (optional, could just return success message)
    const token = generateToken({ userId: newUser.user_id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await UserService.findUserByEmail(email);
    if (!user || !user.password_hash) { // Check for user existence and if they have a password (for traditional login)
      const error = new Error('Invalid credentials.') as CustomError;
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid credentials.') as CustomError;
      error.statusCode = 401;
      throw error;
    }

    // Generate token
    const token = generateToken({ userId: user.user_id });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is set by the `authenticate` middleware
    if (!req.user || !req.user.id) {
      const error = new Error('User not authenticated.') as CustomError;
      error.statusCode = 401;
      throw error;
    }

    const user = await UserService.findUserById(req.user.id);
    if (!user) {
      const error = new Error('User not found.') as CustomError;
      error.statusCode = 404;
      throw error;
    }

    // Return user data (excluding password)
    const { password_hash: password, ...userData } = user;
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};

// --- OAuth Callbacks (simplified for illustration) ---
// In a real app, these would interact with Passport.js for robust OAuth strategies.
// For now, they're just placeholders to demonstrate the concept.

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This part would typically be handled by Passport.js
    // For demo: assume Passport.js has successfully authenticated and added user info to req.user or req.account
    // Example: const { id: googleId, email, displayName } = req.user as any;
    // For now, let's mock it or rely on a successful Passport setup adding it to req.user

    // If Passport.js has successfully authenticated, req.user will contain the user data.
    // If not, this simple controller won't work correctly.
    // Assuming req.user contains the authenticated user from Passport.js or a mock:
    if (!req.user || !req.user.id) {
        const error = new Error('Google authentication failed.') as CustomError;
        error.statusCode = 401;
        throw error;
    }

    // For a real app, you'd use a more robust OAuth flow (e.g., Passport.js)
    // and extract user info from the OAuth provider's response.
    // For this example, let's simulate. In a real Passport.js setup,
    // the 'done' callback in your strategy would populate req.user.
    // We'd then create/find the user in our DB and generate a token.
    // This is a simplified direct token generation after (hypothetical) successful auth.

    // A real Google strategy would call done(null, userObject) if successful.
    // Then req.user would be populated.
    // We're skipping the Passport setup here for brevity.
    const authenticatedUser = await UserService.findUserById(req.user.id); // Assuming req.user.id is populated by passport
    if (!authenticatedUser) {
        const error = new Error('User not found after Google authentication.') as CustomError;
        error.statusCode = 404;
        throw error;
    }

    const token = generateToken({ userId: authenticatedUser.user_id });

    // Redirect to frontend with token (or send token directly, depending on frontend flow)
    // In a real scenario, you'd use a redirect to your frontend with the token
    // e.g., res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);
    res.status(200).json({ success: true, message: 'Google login successful', token });
  } catch (error) {
    next(error);
  }
};

export const linkedinCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.id) {
      const error = new Error('LinkedIn authentication failed.') as CustomError;
      error.statusCode = 401;
      throw error;
    }

    const authenticatedUser = await UserService.findUserById(req.user.id);
    if (!authenticatedUser) {
        const error = new Error('User not found after LinkedIn authentication.') as CustomError;
        error.statusCode = 404;
        throw error;
    }

    const token = generateToken({ userId: authenticatedUser.user_id });
    res.status(200).json({ success: true, message: 'LinkedIn login successful', token });
  } catch (error) {
    next(error);
  }
};