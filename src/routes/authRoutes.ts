// src/routes/authRoutes.ts

import { Router } from 'express';

import Joi from 'joi'; // Import Joi
import { validate } from '../middleware/validation.js'; // Import your Joi-based validate
import { UserRepository } from '../repositories/implementations/UserRepository.js';
import { UserService } from '../services/userService.js';
//import { RegisterUserDto } from '../types/DTO/per-controller/dtos.js'; // Assuming these DTOs exist
import { RegisterUserIncomingDTO } from '../types/DTO/per-controller/response-types/userControlDTOs.js';
import { LoginUserIncomingDTO } from '../types/DTO/per-controller/response-types/userControlDTOs.js';
//import { CustomError } from '../middleware/errorHandler.js'; // Use CustomError
//import { login, register, getMe, logout } from '../controllers/authController.js'; // Import your auth controller

import { AuthController } from '../controllers/authController.js';

import { isAuthenticated } from '../middleware/auth.js';
//import { getMajorInspectionById } from 'controllers/majorInspectionContoller.js';

const authRouter = Router();

// --- DI SETUP ---
const userRepository = new UserRepository(); // Concrete implementation
const userService = new UserService(userRepository); // Inject Repository into Service
const authController = new AuthController(userService); // Inject Service into Controller
// --- END DI SETUP ---

const registerSchema = Joi.object<RegisterUserIncomingDTO>({
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

const loginSchema = Joi.object<LoginUserIncomingDTO>({
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
  authController.register // Call the controller function here
);

authRouter.post(
  '/login',
  validate({ body: loginSchema }), // Apply Joi validation middleware
  authController.login // Call the controller function here
);

authRouter.get('/me', isAuthenticated, authController.getMe);

authRouter.post(
  '/logout',
  isAuthenticated, // Optional: You might want to ensure only authenticated users can "logout"
  // Or, if you simply want to provide a path to clear client-side token, it can be without auth.
  authController.logout
);

// ... (other auth routes like /logout, /me, Google/LinkedIn OAuth)

export default authRouter;
