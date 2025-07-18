// src/routes/authRoutes.ts

import { Router } from 'express';

import Joi from 'joi'; // Import Joi
import { validate } from '../middleware/validation.js'; // Import your Joi-based validate
import { RegisterUserDto, LoginUserDto } from '../types/dtos.js'; // Assuming these DTOs exist
//import { CustomError } from '../middleware/errorHandler.js'; // Use CustomError
import { login, register, getMe, logout } from '../controllers/authController.js'; // Import your auth controller

import { isAuthenticated } from '../middleware/auth.js';
import { getMajorInspectionById } from 'controllers/majorInspectionContoller.js';

const authRouter = Router();

const registerSchema = Joi.object<RegisterUserDto>({
  username: Joi.string().trim().required().messages({
    'string.empty': 'Username is required',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object<LoginUserDto>({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

// --- Local Authentication ---

authRouter.post(
  '/register',

  validate({ body: registerSchema }), // Apply Joi validation middleware
  register // Call the controller function here
);

authRouter.post(
  '/login',
  validate({ body: loginSchema }), // Apply Joi validation middleware
  login // Call the controller function here
);

authRouter.get('/me', isAuthenticated, getMe);

authRouter.post(
  '/logout',
  isAuthenticated, // Optional: You might want to ensure only authenticated users can "logout"
  // Or, if you simply want to provide a path to clear client-side token, it can be without auth.
  logout
);

// ... (other auth routes like /logout, /me, Google/LinkedIn OAuth)

export default authRouter;
