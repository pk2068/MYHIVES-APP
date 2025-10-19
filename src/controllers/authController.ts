import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { CustomError } from '../middleware/errorHandler.js';
import { UserService } from '../services/userService.js'; // New service

import config from '../config/index.js';
import httpStatus from 'http-status'; // Good practice for error codes
import { LoginUserOutgoingDTO, RegisterUserOutgoingDTO } from 'types/DTO/per-controller/response-types/userControlDTOs.js';
import { UserCreationDTO, UserRetrievedDTO } from 'types/DTO/per-controller/user-dto.js';

export class AuthController {
  private readonly _userService: UserService;

  constructor(userService: UserService) {
    this._userService = userService;
  }

  public register = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Registering user:', req.body);
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser: UserRetrievedDTO | null = await this._userService.findUserByEmail(email);
      if (existingUser) {
        const error = new Error('User with this email already exists.') as CustomError;
        error.statusCode = httpStatus.CONFLICT; // 409
        throw error;
      }

      // Hash password
      const hashedPassword: string = await bcrypt.hash(password, 10); // Salt rounds = 10

      const userDataLoad: UserCreationDTO = { username, email, password_hash: hashedPassword };

      // Create user
      const newUser: UserRetrievedDTO = await this._userService.createUser(userDataLoad);

      // // Generate token (optional, could just return success message)
      // const token = generateToken({ userId: newUser.user_id! });
      const responseObj: RegisterUserOutgoingDTO = {
        success: true,
        message: 'User registered successfully! Please log in.',
        user: {
          id: newUser.user_id!,
          username: newUser.username,
          email: newUser.email,
        },
      };

      res.status(201).json(responseObj);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user: UserRetrievedDTO | null = await this._userService.findUserByEmail(email);
      if (!user || !user.password_hash) {
        // Check for user existence and if they have a password (for traditional login)
        const error = new Error('Invalid credentials.') as CustomError;
        error.statusCode = 401; // Unauthorized
        throw error;
      }

      // Compare password
      const isMatch: boolean = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        const error = new Error('Invalid credentials.') as CustomError;
        error.statusCode = 401;
        throw error;
      }

      // Generate token
      const token: string = generateToken({ userId: user.user_id! });

      res.cookie('jwtcookie', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        maxAge: 1000 * 3600 * 24 * 7, // 7 days in milliseconds
      });

      const responseObj: LoginUserOutgoingDTO = {
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
          id: user.user_id!,
          username: user.username,
          email: user.email,
        },
      };

      res.status(200).json(responseObj);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a stateless JWT system, the server doesn't need to do much for logout.
      // The client simply discards the token.
      // However, it's good practice to send a success message.

      // If using HTTP-only cookies for tokens, you'd clear the cookie here.
      // For example:
      res.clearCookie('jwtcookie'); // Assuming your JWT is in a cookie named 'jwtcookie'

      // You might also want to do some logging for audit purposes
      console.log(`User ${req.currentUser?.id || 'unknown'} logged out.`);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('getMe called');
      // req.user is set by the `authenticate` middleware
      if (!req.currentUser || !req.currentUser.id) {
        console.error('No currentUser found in request:', req.currentUser);
        const error = new Error('User not authenticated. - no currentUser') as CustomError;
        error.statusCode = 401;
        throw error;
      }

      console.log('Current user ID:', req.currentUser.id);

      const user: UserRetrievedDTO | null = await this._userService.findUserById(req.currentUser.id);
      if (!user) {
        const error = new Error('User not found.') as CustomError;
        error.statusCode = 404;
        throw error;
      }

      console.log('User found:', user);

      // Return user data (excluding password)
      const { password_hash: password, ...userData } = user;
      res.status(200).json({ success: true, user: userData });
    } catch (error) {
      next(error);
    }
  };
}
