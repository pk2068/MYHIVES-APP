// filepath: src/routes/adminRoutes.ts
import { Router } from 'express';
// import { AdminController } from '../controllers/admin-controller.js';
// import { AdminService } from '../services/admin-service.js';
// import { AdminRepository } from '../repositories/implementations/admin-repository.js';
import { isAuthenticated } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/permission.js';

const adminRouter = Router();

// Initialize the layers (Dependency Injection)
const adminService = new AdminService(new AdminRepository());
const adminController = new AdminController(adminService);

/**
 * BIG PICTURE: All routes in this file are protected.
 * 1. User must be logged in (isAuthenticated) [cite: 2411]
 * 2. User must have 'admin' role (authorizeRole) [cite: 2412]
 */
adminRouter.use(isAuthenticated, authorizeRole(['admin']));

// --- Role Management ---
// GET /api/v1/admin/roles - View all roles
adminRouter.get('/roles', adminController.getAllRoles);

// --- User & User-Role Management ---
// GET /api/v1/admin/users - View all users with their roles
adminRouter.get('/users', adminController.getAllUsersWithRoles);

// GET /api/v1/admin/users/:id - View specific user details
adminRouter.get('/users/:id', adminController.getUserById);

// POST /api/v1/admin/user-roles - Assign a role to a user
adminRouter.post('/user-roles', adminController.assignRoleToUser);

// PUT /api/v1/admin/user-roles/:id - Update a user-role relation (e.g., changing level)
adminRouter.put('/user-roles/:id', adminController.updateUserRole);

// DELETE /api/v1/admin/user-roles/:id - Remove a role from a user
adminRouter.delete('/user-roles/:id', adminController.removeRoleFromUser);

export default adminRouter;
