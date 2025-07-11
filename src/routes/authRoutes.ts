// src/routes/authRoutes.ts

import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import Joi from 'joi'; // Import Joi
import { validate } from '../middleware/validation.js'; // Import your Joi-based validate
import { RegisterUserDto, LoginUserDto } from '../types/dtos.js'; // Assuming these DTOs exist
import { UserService } from '../services/userService.js';
import { CustomError } from '../middleware/errorHandler.js'; // Use CustomError
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//import {CustomRequest} from '../types/custom-request.js'; // To extend Request object with user

const authRouter = Router();

// Assuming isAuthenticated from src/middlewares/isAuthenticated.ts
import { isAuthenticated } from '../middleware/auth.js';
const registerSchema = Joi.object<RegisterUserDto>({
  username: Joi.string().trim().required().messages({
    'string.empty': 'Username is required',
    'any.required': 'Username is required'
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
});

const loginSchema = Joi.object<LoginUserDto>({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),
});

// --- Local Authentication ---

authRouter.post(
  '/register',
  validate({ body: registerSchema }), // <--- This is how you call it
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password }: RegisterUserDto = req.body;

      const existingUser = await UserService.findUserByEmail(email);
      if (existingUser) {
        const error: CustomError = new Error('User with this email already exists');
        error.statusCode = 409; // Conflict
        throw error;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserService.createUser({ username, email, password_hash: hashedPassword });

      const token = jwt.sign({ id: newUser.user_id, email: newUser.email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

      res.status(201).json({ message: 'User registered successfully', user: newUser, token });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  '/login',
  validate({ body: loginSchema }), // <--- This is how you call it
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await UserService.findUserByEmail(email);
      if (!user || !user.password_hash) {
        const error: CustomError = new Error('Invalid credentials');
        error.statusCode = 401; // Unauthorized
        throw error;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        const error: CustomError = new Error('Invalid credentials');
        error.statusCode = 401; // Unauthorized
        throw error;
      }

      const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1d' });

      res.status(200).json({ message: 'Logged in successfully', user: user, token });
    } catch (error) {
      next(error);
    }
  }
);

// ... (other auth routes like /logout, /me, Google/LinkedIn OAuth)

export default authRouter;