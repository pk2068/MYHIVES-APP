import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, generateRefreshToken, generateAccessToken, verifyAccessToken, verifyRefreshToken, calculateTokenExpiry } from '../utils/jwt.js';
import { getSecondsFromConfig, getRemainingSeconds } from '../utils/time-utils.js';
import { CustomError } from '../middleware/errorHandler.js';
import { UserService } from '../services/user-service.js'; // New service
import redisClient from '../utils/redis.js';

import config from '../config/index.js';
import httpStatus from 'http-status'; // Good practice for error codes

import { LoginUserOutgoingDTO, UserOutgoingDTO, UpdateUserIncomingDTO } from './dto/auth-controller.dto.js';
import { UserCreationDTO, UserUpdateDTO, UserRetrievedDTO } from '../services/dto/user-service.dto.js';

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
      const responseObj: UserOutgoingDTO = {
        success: true,
        message: 'User registered successfully! Please log in.',
        user: {
          id: newUser.user_id!,
          username: newUser.username,
          email: newUser.email,
          roles: newUser.roles || [],
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

      const user: UserRetrievedDTO | null = await this._userService.findUserByEmailWithRoles(email);
      //const user: UserRetrievedDTO | null = await this._userService.findUserByEmail(email);
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
      const token: string = generateToken({
        userId: user.user_id!,
        username: user.username,
        roles: user.roles?.join(',') || '',
      });

      const timeoutSeconds = getSecondsFromConfig(config.tokenExpiry);
      console.log(`⌚ Token expiry time in seconds : ${timeoutSeconds}`);

      res.cookie('jwtcookie', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: getSecondsFromConfig(config.tokenExpiry) * 1000, // in milliseconds
      });

      const responseObj: LoginUserOutgoingDTO = {
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
          id: user.user_id!,
          username: user.username,
          email: user.email,
          roles: user.roles || [],
        },
      };

      res.status(200).json(responseObj);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('logout called');
      // req.user is set by the `authenticate` middleware
      if (!req.currentUser || !req.currentUser.id) {
        console.error('No currentUser found in request:', req.currentUser);
        const error = new Error('User not authenticated. - no currentUser') as CustomError;
        error.statusCode = 401;
        throw error;
      }

      const token = req.headers.authorization?.split(' ')[1]; // i know its there from isAuthenticated middleware
      if (!token) {
        const error = new Error('No token provided for logout.') as CustomError;
        error.statusCode = 400;
        throw error;
      }

      // Store token in Redis "blacklist" it
      const tokenExpiryTime = calculateTokenExpiry(token);
      await redisClient.set(`blacklist_${token}`, 'true', { EX: tokenExpiryTime ?? getSecondsFromConfig(config.tokenExpiry) });
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

      const user: UserRetrievedDTO | null = await this._userService.findUserById(req.currentUser.id);
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

  public updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is set by the `authenticate` middleware
      if (!req.currentUser || !req.currentUser.id) {
        console.error('No currentUser found in request:', req.currentUser);
        const error = new Error('User not authenticated. - no currentUser') as CustomError;
        error.statusCode = 401;
        throw error;
      }

      const userId = req.currentUser!.id;
      const updateData: UpdateUserIncomingDTO = req.body;
      console.log('Update data received:', updateData);

      const readyToUpdate: UserUpdateDTO = { ...updateData, password_hash: updateData.password ? await bcrypt.hash(updateData.password, 10) : undefined };

      const user: UserRetrievedDTO = await this._userService.updateUser(userId, readyToUpdate);
      if (!user) {
        const error = new Error('User not found.') as CustomError;
        error.statusCode = 404;
        throw error;
      }

      console.log('User found:', user);

      const responseObj: UserOutgoingDTO = {
        success: true,
        message: 'User updated successfully!',
        user: {
          id: user.user_id!,
          username: user.username,
          email: user.email,
          roles: user.roles || [],
        },
      };

      res.status(200).json(responseObj);
    } catch (error) {
      next(error);
    }
  };

  public googleLoginCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('');
      console.log('Google login callback called ----------------------', req.user, req.currentUser);
      // The user info should be in req.user set by passport
      const dbUser = req.user as any; // Adjust type as needed based on your passport setup
      console.log('Google profile in callback:', dbUser);
      if (!dbUser) {
        const error = new Error('Google authentication failed.') as CustomError;
        error.statusCode = 401;
        throw error;
      }
      // Generate token
      const token: string = generateToken({
        userId: dbUser.user_id!,
        username: dbUser.username,
        roles: dbUser.roles.join(',') || '',
      });

      res.cookie('jwtcookie', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: getSecondsFromConfig(config.tokenExpiry) * 1000, // in milliseconds
      });

      const responseObj: LoginUserOutgoingDTO = {
        success: true,
        message: 'Logged in with Google successfully!',
        token,
        user: {
          id: dbUser.user_id!,
          username: dbUser.username,
          email: dbUser.email,
          roles: dbUser.roles || [],
        },
      };

      res.status(200).json(responseObj);
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies['refreshToken'] || req.headers['x-refresh-token'];
      if (!refreshToken) {
        const error = new Error('No refresh token provided.') as CustomError;
        error.statusCode = 401;
        throw error;
      }

      const decoded = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken({ userId: decoded.userId, username: decoded.username, roles: decoded.roles });

      // Optional: Generate a NEW refresh token here for "Rotation"
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      //res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
      const _error = new Error('Invalid or expired refresh token.') as CustomError;
      _error.statusCode = 401;
      next(_error);
    }
  };
}
