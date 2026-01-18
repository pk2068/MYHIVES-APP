// src/routes/authRoutes.ts

import { Router } from 'express';

import Joi from 'joi'; // Import Joi
import { validate } from '../middleware/validation.js'; // Import your Joi-based validate
import { UserRepository } from '../repositories/implementations/user-repository.js';
import { UserService } from '../services/user-service.js';
//import { RegisterUserDto } from '../types/DTO/per-controller/dtos.js'; // Assuming these DTOs exist
import { RegisterUserIncomingDTO, LoginUserIncomingDTO, UpdateUserIncomingDTO } from '../controllers/dto/auth-controller.dto.js';

import { AuthController } from '../controllers/auth-controller.js';

import { isAuthenticated } from '../middleware/auth.js';

import passport from '../config/passport.js';

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

const updateSchema = Joi.object<UpdateUserIncomingDTO>({
  username: Joi.string().trim().optional(),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters long',
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

authRouter.get('/google-login', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google-login/callback', passport.authenticate('google', { session: false }), authController.googleLoginCallback);
authRouter.get('/refresh-token', authController.refreshToken);

authRouter.get('/me', isAuthenticated, authController.getMe);

authRouter.post(
  '/logout',
  isAuthenticated, // Optional: You might want to ensure only authenticated users can "logout"
  // Or, if you simply want to provide a path to clear client-side token, it can be without auth.
  authController.logout
);

authRouter.put('/me', isAuthenticated, validate({ body: updateSchema }), authController.updateMe);

// ... (other auth routes like /logout, /me, Google/LinkedIn OAuth)

export default authRouter;
